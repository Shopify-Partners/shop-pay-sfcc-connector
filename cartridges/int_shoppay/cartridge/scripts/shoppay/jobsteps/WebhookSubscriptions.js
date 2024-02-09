'use strict'

var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Status = require('dw/system/Status');
var URLUtils = require('dw/web/URLUtils');

var adminAPI = require('*/cartridge/scripts/shoppay/adminAPI');
var logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');

const callbackEndpoints = {
    "ORDERS_CREATE": URLUtils.https('Webhooks-OrdersCreate').toString()
};

/**
 *
 * @param {*} userErrors
 * @returns {object}
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
 *
 * @param {*} userErrors
 * @returns {object}
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
 *
 * @param {*} webhookObj
 * @param {*} webhookData
 * @returns
 */
function setSubscriptionObjectData(webhookObj, webhookData) {
    webhookObj.custom.topic = webhookData.topic;
    webhookObj.custom.callbackUrl = webhookData.endpoint.callbackUrl;
    webhookObj.custom.subscriptionId = webhookData.id;
    webhookObj.custom.format = webhookData.format;
    return webhookObj;
}

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
