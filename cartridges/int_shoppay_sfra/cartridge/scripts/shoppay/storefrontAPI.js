'use strict'

var logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');

/**
 * Function to create a GraphQL ShopPay payment request session
 * @param {Object} paymentRequest - the Shop Pay payment request object representing the customer's basket
 * @returns {Object} The GraphQL service response body
 */
function shopPayPaymentRequestSessionCreate(basket, paymentRequest) {
    try {
        const bodyObj = {
            query: 'mutation shopPayPaymentRequestSessionCreate($sourceIdentifier: String!, $paymentRequest: ShopPayPaymentRequestInput!) {shopPayPaymentRequestSessionCreate(sourceIdentifier: $sourceIdentifier, paymentRequest: $paymentRequest) {shopPayPaymentRequestSession {token sourceIdentifier checkoutUrl paymentRequest {total {amount currencyCode}}} userErrors{field message}}}',
            variables: {
                sourceIdentifier: basket.UUID,
                paymentRequest: paymentRequest
            }
        };
        var shopPayStorefrontService = require('*/cartridge/scripts/shoppay/service/shopPayStorefrontService')();
        var response = shopPayStorefrontService.call({
            body: bodyObj || {}
        });

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
 * @param {String} token - the Shop Pay session token returned in the session create GraphQL response
 * @returns {Object} The GraphQL service response body
 */
function shopPayPaymentRequestSessionSubmit(paymentRequest, token) {
    var shopPayServiceHelper = require('*/cartridge/scripts/shoppay/helpers/serviceHelpers');
    /* Kristin TODO: Verify that the paymentRequest.paymentMethod is passed in from the client-side JS here
       when the modal flows are implemented. */
    try {
        const bodyObj = {
            query: 'mutation shopPayPaymentRequestSessionSubmit($token: String!, $paymentRequest: ShopPayPaymentRequestInput!, $idempotencyKey: String!) {shopPayPaymentRequestSessionSubmit(token: $token, paymentRequest: $paymentRequest, idempotencyKey: $idempotencyKey) {paymentRequestReceipt {token processingStatusType} userErrors {field message}}}',
            variables: {
                token: token,
                idempotencyKey: dw.util.UUIDUtils.createUUID(), // Kristin TODO: Do we need to store and reuse within session?
                paymentRequest: paymentRequest
            }
        };
        var shopPayStorefrontService = require('*/cartridge/scripts/shoppay/service/shopPayStorefrontService')();
        var response = shopPayStorefrontService.call({
            body: bodyObj || {}
        });

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
    shopPayPaymentRequestSessionCreate: shopPayPaymentRequestSessionCreate,
    shopPayPaymentRequestSessionSubmit: shopPayPaymentRequestSessionSubmit
};
