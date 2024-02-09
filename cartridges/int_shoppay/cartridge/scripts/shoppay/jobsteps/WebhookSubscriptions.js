'use strict'

var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Status = require('dw/system/Status');
var URLUtils = require('dw/web/URLUtils');

var adminAPI = require('*/cartridge/scripts/shoppay/adminAPI');
var logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');

const callbackEndpoints = {
    "ORDERS_CREATE": URLUtils.https('Webhooks-OrdersCreate').toString()
};

exports.Subscribe = function(params, stepExecution) {
    var response;
    try {
        var topic = params.WebhookTopic;
        if (!topic) {
            return new Status(Status.ERROR, 'No webhook topic provided for subscribe action');
        }
        //var callbackUrl = callbackEndpoints[topic];
        var callbackUrl = 'https://webhook.site/9ae0c822-d2f9-46ed-9f91-7c38e714401d';

        response = adminAPI.subscribeWebhook(topic, callbackUrl);
        if (response.error || !response.webhookSubscriptionCreate) {
            logger.error('Subscribe action failed for webhook ' + topic + ' : ' + callbackUrl);
            return new Status(Status.ERROR, 'Webhook subscribe failed: ' + topic);
        } else if (response.webhookSubscriptionCreate.userErrors.length > 0) {
            // Kristin TODO: Check for "already subscribed" and create custom object if it does not exist
            // (may need additional graphQL call to retrieve the details for the existing webhook),
            // otherwise return error
            return new Status(Status.ERROR, 'Webhook subscribe failed: ' + topic);
        }

        var webhookData = response.webhookSubscriptionCreate.webhookSubscription;
        var webhookObj = CustomObjectMgr.createCustomObject('ShopPayWebhookSubscriptions', webhookData.legacyResourceId);
        webhookObj.custom.topic = topic;
        webhookObj.custom.callbackUrl = callbackUrl;
        webhookObj.custom.subscriptionId = webhookData.id;
        webhookObj.custom.format = webhookData.format;
    } catch (e) {
        logger.error('[WebhookSubscriptions.js] error: \n\r' + e.message + '\n\r' + e.stack);
        return new Status(Status.ERROR, 'Exception thrown: ' + e.message);
    }

    return new Status(Status.OK);
};

exports.Unsubscribe = function(params, stepExecution) {
    var response;
    try {
        var id = params.WebhookId;
        if (!id) {
            return new Status(Status.ERROR, 'No webhook ID provided for unsubscribe action');
        }
        var webhookObj = CustomObjectMgr.getCustomObject('ShopPayWebhookSubscriptions', id);

        response = adminAPI.unsubscribeWebhook('gid://shopify/WebhookSubscription/' + id);
        if (response.error || !response.webhookSubscriptionDelete) {
            logger.error('Subscribe action failed for webhook ' + id);
            return new Status(Status.ERROR, 'Webhook unsubscribe failed: ' + id);
        } else if (response.webhookSubscriptionDelete.userErrors.length > 0) {
            // Kristin TODO: Check for "already subscribed" and create custom object if it does not exist
            // (may need additional graphQL call to retrieve the details for the existing webhook),
            // otherwise return error
            return new Status(Status.ERROR, 'Webhook unsubscribe failed: ' + id);
        }

        if (webhookObj) {
            CustomObjectMgr.remove(webhookObj);
        }
    } catch (e) {
        logger.error('[WebhookSubscriptions.js] error: \n\r' + e.message + '\n\r' + e.stack);
        return new Status(Status.ERROR, 'Exception thrown: ' + e.message);
    }

    return new Status(Status.OK);
};
