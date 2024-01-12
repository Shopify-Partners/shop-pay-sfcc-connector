const shopPayGraphQLService = require('*/cartridge/scripts/service/shopPayGraphQLService');

const shopPayServicelHelper = require('*/cartridge/scripts/shopify/helpers/serviceHelpers');

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
                paymentRequest: shopPayServicelHelper.getMockPaymentRequest('createSession')
            }
        };

        var response = shopPayGraphQLService.call({
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
 * @param {string} sourceIdentifier - Basket UUID
 */
function shopPayPaymentRequestSessionSubmit(sourceIdentifier) {
    try {

        const bodyObj = {
            query: 'mutation shopPayPaymentRequestSessionSubmit($token: String!, $paymentRequest: ShopPayPaymentRequest, $idempotencyKey: String!) {shopPayPaymentRequestSession(token: $token, paymentRequest: $paymentRequest, idempotencyKey: $idempotencyKey) {paymentRequestReceipt {token processingStatusType} userErrors {field message}}}',
            variables: {
                sourceIdentifier: sourceIdentifier,
                token: 'db4eede13822684b13a607823b7ba40d', //not sure where this token comes from
                idempotencyKey: dw.util.UUIDUtils.createUUID(),
                paymentRequest: shopPayServicelHelper.getMockPaymentRequest('sessionSubmit')
            }
        };

        var response = shopPayGraphQLService.call({
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