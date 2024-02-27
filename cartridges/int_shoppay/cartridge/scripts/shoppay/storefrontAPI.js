'use strict'

var logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');
var Result = require('dw/svc/Result');

/**
 * Function to create a GraphQL ShopPay payment request session
 * @param {Object} paymentRequest - the Shop Pay payment request object representing the customer's basket
 * @returns {Object} The GraphQL service response body
 */
function shoppayPaymentRequestSessionCreate(basket, paymentRequest) {
    if (paymentRequest.shippingAddress && paymentRequest.shippingAddress.id) {
        delete paymentRequest.shippingAddress.id;
    }
    try {
        const bodyObj = {
            query: 'mutation shoppayPaymentRequestSessionCreate($sourceIdentifier: String!, $paymentRequest: ShopPayPaymentRequestInput!) {shoppayPaymentRequestSessionCreate(sourceIdentifier: $sourceIdentifier, paymentRequest: $paymentRequest) {shopPayPaymentRequestSession {token sourceIdentifier checkoutUrl paymentRequest {total {amount currencyCode}}} userErrors{field message}}}',
            variables: {
                sourceIdentifier: basket.UUID,
                paymentRequest: paymentRequest
            }
        };
        var shoppayStorefrontService = require('*/cartridge/scripts/shoppay/service/shoppayStorefrontService')();
        var response = shoppayStorefrontService.call({
            body: bodyObj || {}
        });

        if (response.status === Result.SERVICE_UNAVAILABLE) {
            // retry service call once
            response = shoppayStorefrontService.call({
                body: bodyObj || {}
            });
        }

        var responseHeaders = shoppayStorefrontService.client.responseHeaders;
        var shopifyRequestID = responseHeaders.get('X-Request-ID');
        if (shopifyRequestID && shopifyRequestID.length > 0) {
            logger.info('X-Request-ID: {0}', shopifyRequestID[0]);
        }

        if (!response.ok
            || !response.object
            || (response.object.errors && response.object.errors.length > 0)
            || !response.object.data) {
            return {
                error: true,
                errorMsg: response.errorMessage
            }
        }
        return response.object.data;
    } catch (e) {
        logger.error('[storefrontAPI.js] error: \n\r' + e.message + '\n\r' + e.stack);
        return {
            error: true,
            errorMsg: e.message
        };
    }
}

/**
 * Function to create a GraphQL ShopPay payment request session
 * @param {Object} paymentRequest - the Shop Pay payment request object representing the customer's basket
 * @param {string} token - the Shop Pay session token returned in the session create GraphQL response
 * @returns {Object} The GraphQL service response body
 */
function shopPayPaymentRequestSessionSubmit(paymentRequest, token) {
    /* shippingAddress.id is a Shop Pay specific/provided element and is not a valid input for the GraphQL session
       submit request, but is included in the payment request object from the client-side Shop Pay session */
    if (paymentRequest.shippingAddress.id) {
        delete paymentRequest.shippingAddress.id;
    }
    try {
        const bodyObj = {
            query: 'mutation shopPayPaymentRequestSessionSubmit($token: String!, $paymentRequest: ShopPayPaymentRequestInput!, $idempotencyKey: String!) {shopPayPaymentRequestSessionSubmit(token: $token, paymentRequest: $paymentRequest, idempotencyKey: $idempotencyKey) {paymentRequestReceipt {token processingStatusType} userErrors {field message}}}',
            variables: {
                token: token,
                idempotencyKey: dw.util.UUIDUtils.createUUID(), // Kristin TODO: Do we need to store and reuse within session?
                paymentRequest: paymentRequest
            }
        };
        var shoppayStorefrontService = require('*/cartridge/scripts/shoppay/service/shoppayStorefrontService')();
        var response = shoppayStorefrontService.call({
            body: bodyObj || {}
        });

        var responseHeaders = shoppayStorefrontService.client.responseHeaders;
        var shopifyRequestID = responseHeaders.get('X-Request-ID');
        if (shopifyRequestID && shopifyRequestID.length > 0) {
            logger.info('X-Request-ID: {0}', shopifyRequestID[0]);
        }

        if (!response.ok
            || !response.object
            || (response.object.errors && response.object.errors.length > 0)
            || !response.object.data) {
            return {
                error: true,
                errorMsg: response.errorMessage
            }
        }
        return response.object.data;
    } catch (e) {
        logger.error('[storefrontAPI.js] error: \n\r' + e.message + '\n\r' + e.stack);
        return {
            error: true,
            errorMsg: e.message
        };
    }
}

module.exports = {
    shoppayPaymentRequestSessionCreate: shoppayPaymentRequestSessionCreate,
    shopPayPaymentRequestSessionSubmit: shopPayPaymentRequestSessionSubmit
};
