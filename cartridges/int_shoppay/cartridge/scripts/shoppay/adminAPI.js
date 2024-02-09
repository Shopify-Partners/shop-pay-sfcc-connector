'use strict'

var logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');

/**
 * Function to retrieve the details of a Shop Pay order using the Shopify GraphQL Admin API
 * @param {string} sourceIdentifier - the sourceIdentifier value (SFCC basket UUID) sent to Shopify during checkout
 * @returns {Object} The GraphQL service response body
 */
function getOrderBySourceIdentifier(sourceIdentifier) {
    try {
        var queryString = "query {orders(first: 1, query: \"source_identifier:'" + sourceIdentifier + "'\") {edges {node {id name sourceIdentifier email billingAddress {firstName lastName address1 address2 city provinceCode countryCodeV2 phone }}}}}";
        const bodyObj = {
            "query":queryString,
            "variables":{}
        };
        var shoppayAdminService = require('*/cartridge/scripts/shoppay/service/shoppayAdminService')();
        var response = shoppayAdminService.call({
            body: bodyObj || {}
        });

        // Kristin TODO: Remove !response.object.data from third conditional if permissions issue is resolved
        if (!response.ok
            || !response.object
            || !response.object.data
            || (response.object.errors && response.object.errors.length > 0 && !response.object.data)
        ) {
            return {
                error: true,
                errorMsg: response.errorMessage
            }
        }
        return response.object.data;
    } catch (e) {
        logger.error('[adminAPI.js] error: \n\r' + e.message + '\n\r' + e.stack);
        return {
            error: true,
            errorMsg: e.message
        };
    }
}

/**
 * Subscribes an SFCC controller endpoint to a relevant Shopify webhook.
 * @param {string} topic - The webhook topic
 * @param {string} callbackUrl - The webhook callback URL
 * @returns {Object} - An object representing an error or the GraphQL service response body
 */
function subscribeWebhook(topic, callbackUrl) {
    var queryString = "mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {userErrors {field message} webhookSubscription {id legacyResourceId format topic endpoint {__typename ... on WebhookHttpEndpoint {callbackUrl}}}}}";
    const bodyObj = {
        query: queryString,
        variables: {
            topic: topic,
            webhookSubscription: {
                format: "JSON",
                callbackUrl: callbackUrl
            }
        }
    };

    var shoppayAdminService = require('*/cartridge/scripts/shoppay/service/shoppayAdminService')();
    var response = shoppayAdminService.call({
        body: bodyObj || {}
    });
    // Kristin TODO: Add some response header logging for troubleshooting purposes?
    var test = shoppayAdminService.client.responseHeaders;
    var test2 = shoppayAdminService.client.allResponseHeaders;
    if (!response.ok
        || !response.object
        || !response.object.data
        || (response.object.errors && response.object.errors.length > 0)
    ) {
        return {
            error: true,
            errorMsg: response.errorMessage
        };
    }
    return response.object.data;
}

/**
 * Searches for an existing Shopify webhook subscription with matching topic and callback Url.
 * @param {string} topic - The webhook topic
 * @param {string} callbackUrl - The webhook callback URL (SFCC controller endpoint as absolute URL)
 * @returns {Object} - An object representing an error or the GraphQL service response body
 */
function getExistingWebhook(topic, callbackUrl) {
    var queryString = "{webhookSubscriptions(first: 1, topics:" + topic + ", callbackUrl: \"" + callbackUrl + "\") {edges {node {id legacyResourceId format topic endpoint {__typename ... on WebhookHttpEndpoint {callbackUrl}}}}}}";
    const bodyObj = {
        query: queryString,
        variables: {}
    };

    var shoppayAdminService = require('*/cartridge/scripts/shoppay/service/shoppayAdminService')();
    var response = shoppayAdminService.call({
        body: bodyObj || {}
    });

    if (!response.ok
        || !response.object
        || !response.object.data
        || (response.object.errors && response.object.errors.length > 0)
    ) {
        return {
            error: true,
            errorMsg: response.errorMessage
        };
    }
    return response.object.data;
}

/**
 * Unsubscribes an SFCC controller endpoint from a Shopify webhook.
 * @param {string} id - The webhook ID to unsubscribe (format: "gid://shopify/WebhookSubscription/1464424628544")
 * @returns {Object} - An object representing an error or the GraphQL service response body
 */
function unsubscribeWebhook(id) {
    var queryString = "mutation webhookSubscriptionDelete($id: ID!) {webhookSubscriptionDelete(id: $id) {deletedWebhookSubscriptionId userErrors {field message }}}";
    const bodyObj = {
        query: queryString,
        variables: {
            id: id
        }
    };

    var shoppayAdminService = require('*/cartridge/scripts/shoppay/service/shoppayAdminService')();
    var response = shoppayAdminService.call({
        body: bodyObj || {}
    });
    if (!response.ok
        || !response.object
        || !response.object.data
        || (response.object.errors && response.object.errors.length > 0)
    ) {
        return {
            error: true,
            errorMsg: response.errorMessage
        };
    }
    return response.object.data;
}

module.exports = {
    getOrderBySourceIdentifier: getOrderBySourceIdentifier,
    subscribeWebhook: subscribeWebhook,
    getExistingWebhook: getExistingWebhook,
    unsubscribeWebhook: unsubscribeWebhook
};
