const shopPayStorefrontService = require('*/cartridge/scripts/service/shopPayStorefrontService');

const shopPayServiceHelper = require('*/cartridge/scripts/shopify/helpers/serviceHelpers');

/**
 * Function to create a GraphQL ShopPay payment request session
 *
 * @param {string} sourceIdentifier - Basket UUID
 */
function shopPayPaymentRequestSessionCreate(sourceIdentifier) {
    try {
        const bodyObj = {
            query: 'mutation shopPayPaymentRequestSessionCreate($sourceIdentifier: String!, $paymentRequest: ShopPayPaymentRequestInput!) {shopPayPaymentRequestSessionCreate(sourceIdentifier: $sourceIdentifier, paymentRequest: $paymentRequest) {shopPayPaymentRequestSession {token sourceIdentifier checkoutUrl paymentRequest {total ...}} userErrors{field message}}}',
            variables: {
                sourceIdentifier: sourceIdentifier,
                paymentRequest: shopPayServiceHelper.getMockPaymentRequest('createSession')
            }
        };

        var response = shopPayStorefrontService.call({
            body: JSON.stringify(bodyObj) || {}
        });

        return {
            response: response
        };
    } catch (err) {
        return { err: createErrorMsg(err.message) };
    }
}

/**
 * Function to create a GraphQL ShopPay payment request session
 *
 */
function shopPayPaymentRequestSessionSubmit() {
    try {

        const bodyObj = {
            query: 'mutation shopPayPaymentRequestSessionSubmit($token: String!, $paymentRequest: ShopPayPaymentRequest, $idempotencyKey: String!) {shopPayPaymentRequestSession(token: $token, paymentRequest: $paymentRequest, idempotencyKey: $idempotencyKey) {paymentRequestReceipt {token processingStatusType} userErrors {field message}}}',
            variables: {
                token: 'db4eede13822684b13a607823b7ba40d', //Comes from session create response
                idempotencyKey: dw.util.UUIDUtils.createUUID(),
                paymentRequest: shopPayServiceHelper.getMockPaymentRequest('sessionSubmit')
            }
        };

        var response = shopPayStorefrontService.call({
            body: JSON.stringify(bodyObj) || {}
        });

        return {
            response: response
        };
    } catch (err) {
        return { err: createErrorMsg(err.message) };
    }
}

module.exports = {
    shopPayPaymentRequestSessionCreate: shopPayPaymentRequestSessionCreate,
    shopPayPaymentRequestSessionSubmit: shopPayPaymentRequestSessionSubmit
};