'use strict'

var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Status = require('dw/system/Status');
var URLUtils = require('dw/web/URLUtils');

var adminAPI = require('*/cartridge/scripts/shoppay/adminAPI');
var logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');

const callbackEndpoints = {
    "ORDERS_CREATE": URLUtils.https('ShopPayWebhooks-OrdersCreate').toString()
};

/**
 * Parses a set of userErrors from a Shopify webhook subscribe request to determine if the
 * subscribe action failed because the subscription for that callbackUrl and topic already
 * exists.
 * @param {Object} userErrors - an array of userErrors from the GraphQL response
 * @returns {boolean} - true if the error is due to "already subscribed", false if some other cause
 */
function isAlreadySubscribedError(userErrors) {
    var subscribed = false;
    var index = 0;
    while (!subscribed && index < userErrors.length) {
        var error = userErrors[index];
        var field = error.field;
        if (field.length == 2
            && field.indexOf('webhookSubscription') >= 0
            && field.indexOf('callbackUrl') >= 0
            && error.message == "Address for this topic has already been taken"
        ) {
            subscribed = true;
        };
        index++;
    }
    return subscribed;
}

/**
 * Parses a set of userErrors from a Shopify webhook unsubscribe request to determine if the
 * unsubscribe action failed because the subscription with that ID does not exist (already unsubscribed
 * or never subscribed).
 * @param {Object} userErrors - an array of userErrors from the GraphQL response
 * @returns {boolean} - true if the error is due to "not found", false if some other cause
 */
function isSubscriptionNotFoundError(userErrors) {
    var existenceErrorFound = false;
    var index = 0;
    while (!existenceErrorFound && index < userErrors.length) {
        var error = userErrors[index];
        var field = error.field;
        if (field.length == 1
            && field[0] == "id"
            && error.message == "Webhook subscription does not exist"
        ) {
            existenceErrorFound = true;
        };
        index++;
    }
    return existenceErrorFound;
}

/**
 * Assigns the details of a Shopify webhook subscription to an SFCC custom object for reference (and
 * future unsubscribe, if necessary).
 * @param {Object} webhookObj - The custom object in which the subscription details will be stored
 * @param {dw.object.CustomObject} webhookData - The webhook data from the GraphQL webhook subscribe response
 */
function setSubscriptionObjectData(webhookObj, webhookData) {
    webhookObj.custom.topic = webhookData.topic;
    webhookObj.custom.callbackUrl = webhookData.endpoint.callbackUrl;
    webhookObj.custom.subscriptionId = webhookData.id;
    webhookObj.custom.format = webhookData.format;
}

/**
 * This job step subscribes an SFCC controller endpoint to a relevant Shopify webhook and captures the subscription
 * information in a custom object for reference (and future unsubscribe, if necessary).
 * @param {dw.util.HashMap} params - Map of job step inputs
 * @param {dw.job.JobStepExecution} stepExecution - Represents an execution of a step that belongs to a job.
 * @returns {dw.system.Status} Status object indicating job step success or failure.
 */
exports.Subscribe = function(params, stepExecution) {
    try {
        var topic = params.WebhookTopic;
        var webhookData;
        if (!topic) {
            return new Status(Status.ERROR, 'No webhook topic provided for subscribe action');
        }
        // Kristin TODO: Toggle next 2 lines when Shopify permissions are resolved
        //var callbackUrl = callbackEndpoints[topic];
        var callbackUrl = 'https://webhook.site/9ae0c822-d2f9-46ed-9f91-7c38e714401d';

        var response = adminAPI.subscribeWebhook(topic, callbackUrl);
        if (response.error || !response.webhookSubscriptionCreate) {
            return new Status(Status.ERROR, 'Webhook subscribe failed: ' + topic);
        } else if (response.webhookSubscriptionCreate.userErrors.length > 0) {
            var subscribed = isAlreadySubscribedError(response.webhookSubscriptionCreate.userErrors);
            if (!subscribed) {
                return new Status(Status.ERROR, 'Webhook subscribe failed: ' + topic);
            }
            // Get the details of the already subscribed webhook to create/update custom object in SFCC
            var webhookSearchResponse = adminAPI.getExistingWebhook(topic, callbackUrl);
            if (webhookSearchResponse.error
                || !webhookSearchResponse.webhookSubscriptions
                || webhookSearchResponse.webhookSubscriptions.edges.length == 0
            ) {
                return new Status(Status.ERROR, 'Webhook subscribe failed: ' + topic);
            }
            webhookData = webhookSearchResponse.webhookSubscriptions.edges[0].node;
        } else {
            webhookData = response.webhookSubscriptionCreate.webhookSubscription;
        }

        // If webhook custom object already exists, update it with the response data to ensure accuracy
        var webhookObj = CustomObjectMgr.getCustomObject('ShopPayWebhookSubscriptions', webhookData.legacyResourceId);
        if (!webhookObj) {
            webhookObj = CustomObjectMgr.createCustomObject('ShopPayWebhookSubscriptions', webhookData.legacyResourceId);
        }
        setSubscriptionObjectData(webhookObj, webhookData);
    } catch (e) {
        logger.error('[WebhookSubscriptions.js] error: \n\r' + e.message + '\n\r' + e.stack);
        return new Status(Status.ERROR, 'Exception thrown: ' + e.message);
    }

    return new Status(Status.OK);
};

/**
 * This job step removes a Shopify webhook subscription by webhook subscription ID and deletes the SFCC custom
 * object that stored the subscription data, if it exists.
 * @param {dw.util.HashMap} params - Map of job step inputs
 * @param {dw.job.JobStepExecution} stepExecution - Represents an execution of a step that belongs to a job.
 * @returns {dw.system.Status} Status object indicating job step success or failure.
 */
exports.Unsubscribe = function(params, stepExecution) {
    try {
        var id = params.WebhookId;
        if (!id) {
            return new Status(Status.ERROR, 'No webhook ID provided for unsubscribe action');
        }

        var response = adminAPI.unsubscribeWebhook('gid://shopify/WebhookSubscription/' + id);
        if (response.error || !response.webhookSubscriptionDelete) {
            return new Status(Status.ERROR, 'Webhook unsubscribe failed: ' + id);
        } else if (response.webhookSubscriptionDelete.userErrors.length > 0) {
            var subscriptionNotFoundError = isSubscriptionNotFoundError(response.webhookSubscriptionDelete.userErrors);
            if (!subscriptionNotFoundError) {
                return new Status(Status.ERROR, 'Webhook unsubscribe failed: ' + id);
            }
            // If webhook subscription did not exist, continue as though unsubscribe was successful
        }

        var webhookObj = CustomObjectMgr.getCustomObject('ShopPayWebhookSubscriptions', id);
        if (webhookObj) {
            CustomObjectMgr.remove(webhookObj);
        }
    } catch (e) {
        logger.error('[WebhookSubscriptions.js] error: \n\r' + e.message + '\n\r' + e.stack);
        return new Status(Status.ERROR, 'Exception thrown: ' + e.message);
    }

    return new Status(Status.OK);
};
