const shopPayServiceHelper = require('*/cartridge/scripts/shoppay/helpers/serviceHelpers');

/**
 * Function to create a GraphQL ShopPay payment request session
 * @param {dw.order.LineItemCtnr} basket - the customer's current basket
 * @returns {Object} The QraphQL service response body
 */
function shopPayPaymentRequestSessionCreate(basket) {
    try {
        const bodyObj = {
            query: 'mutation shopPayPaymentRequestSessionCreate($sourceIdentifier: String!, $paymentRequest: ShopPayPaymentRequestInput!) {shopPayPaymentRequestSessionCreate(sourceIdentifier: $sourceIdentifier, paymentRequest: $paymentRequest) {shopPayPaymentRequestSession {token sourceIdentifier checkoutUrl paymentRequest {total ...}} userErrors{field message}}}',
            variables: {
                sourceIdentifier: basket.UUID,
                paymentRequest: shopPayServiceHelper.getMockPaymentRequest('createSession')
            }
        };
        var shopPayStorefrontService = require('*/cartridge/scripts/shoppay/service/shopPayStorefrontService')();
        var response = shopPayStorefrontService.call({
            body: bodyObj || {}
        });

        return response.object;
    } catch (err) {
        return { err: err.message };
    }
}

/**
 * Function to create a GraphQL ShopPay payment request session
 * @returns {Object} The QraphQL service response body
 */
function shopPayPaymentRequestSessionSubmit() {
    try {
        const bodyObj = {
            query: 'mutation shopPayPaymentRequestSessionSubmit($token: String!, $paymentRequest: ShopPayPaymentRequest, $idempotencyKey: String!) {shopPayPaymentRequestSession(token: $token, paymentRequest: $paymentRequest, idempotencyKey: $idempotencyKey) {paymentRequestReceipt {token processingStatusType} userErrors {field message}}}',
            variables: {
                token: 'db4eede13822684b13a607823b7ba40d', // TODO: pull token from session create response
                idempotencyKey: dw.util.UUIDUtils.createUUID(),
                paymentRequest: shopPayServiceHelper.getMockPaymentRequest('sessionSubmit') // TODO: will need to be updated to pull from BE Controller ShopPay-GetCartSummary
            }
        };
        var shopPayStorefrontService = require('*/cartridge/scripts/shoppay/service/shopPayStorefrontService');
        var response = shopPayStorefrontService.call({
            body: bodyObj || {}
        });

        return {
            response: response
        };
    } catch (err) {
        return { err: err.message };
    }
}

module.exports = {
    shopPayPaymentRequestSessionCreate: shopPayPaymentRequestSessionCreate,
    shopPayPaymentRequestSessionSubmit: shopPayPaymentRequestSessionSubmit
};
