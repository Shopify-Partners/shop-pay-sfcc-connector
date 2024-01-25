'use strict';
var Resource = require('dw/web/Resource');


/**
 * If the information is valid a Shop Pay payment instrument is created.
 * @return {Object} an object that contains error information
 */
function Handle() {
    var errors = [];
    return { fieldErrors: [], serverErrors: errors, error: false };
}

/**
 * Authorizes a payment using Shop Pay.
 * @return {Object} an object that contains error information
 */
function Authorize(paymentRequest, token) {
    var serverErrors = [];
    var fieldErrors = {};
    var error = false;
    var storefrontAPI = require('*/cartridge/scripts/shoppay/storefrontAPI');
    // Kristin TODO: Replace currentBasket with order and move into hook script
    var response = storefrontAPI.shopPayPaymentRequestSessionSubmit(paymentRequest, token);
    if (!response
        || response.error
        || !response.shopPayPaymentRequestSessionSubmit
        || response.shopPayPaymentRequestSessionSubmit.userErrors.length > 0
    ) {
        error = true;
        serverErrors.push(Resource.msg('shoppay.service.error', 'shoppay', null));
    }
    return { fieldErrors: fieldErrors, serverErrors: serverErrors, error: false };
}

exports.Handle = Handle;
exports.Authorize = Authorize;
