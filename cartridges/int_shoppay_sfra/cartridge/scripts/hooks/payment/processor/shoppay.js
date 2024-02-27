'use strict';

var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var collections = require('*/cartridge/scripts/util/collections');
var shoppayGlobalRefs = require('*/cartridge/scripts/shoppayGlobalRefs');

/**
 * Creates the Shop Pay payment instrument.
 * @param {dw.order.LineItemCtnr} basket - the target basket
 * @return {Object} an object that contains error information
 */
function Handle(basket) {
    var serverErrors = [];
    var fieldErrors = {};
    var error = false;
    var paymentInstruments = basket.getPaymentInstruments();

    Transaction.wrap(function () {
        collections.forEach(paymentInstruments, function (item) {
            basket.removePaymentInstrument(item);
        });

        /* Split payments, including partial payment with gift cards, are not supported by the Shop Pay modal
           so the transaction amount will always be the total gross price of the basket */
        var paymentInstrument = basket.createPaymentInstrument(
            shoppayGlobalRefs.shoppayPaymentMethodId, basket.totalGrossPrice
        );
        basket.custom.shoppaySourceIdentifier = basket.UUID;
    });

    return { fieldErrors: [], serverErrors: serverErrors, error: false };
}

/**
 * Authorizes a payment using Shop Pay
 * @param {Object} paymentRequest - The Shop Pay payment request object
 * @param {string} token - The Shop Pay session token
 * @param {dw.order.PaymentInstrument} - The Shop Pay payment instrument
 * @return {Object} an object that contains error information
 */
function Authorize(paymentRequest, token, paymentInstrument) {
    var serverErrors = [];
    var fieldErrors = {};
    var error = false;
    var storefrontAPI = require('*/cartridge/scripts/shoppay/storefrontAPI');
    var response = storefrontAPI.shoppayPaymentRequestSessionSubmit(paymentRequest, token);
    if (!response
        || response.error
        || !response.shopPayPaymentRequestSessionSubmit
        || response.shopPayPaymentRequestSessionSubmit.userErrors.length > 0
        || !response.shopPayPaymentRequestSessionSubmit.paymentRequestReceipt
    ) {
        error = true;
        serverErrors.push(Resource.msg('shoppay.service.error', 'shoppay', null));
        return { fieldErrors: fieldErrors, serverErrors: serverErrors, error: error };
    }

    Transaction.wrap(function() {
        paymentInstrument.custom.shoppayPaymentToken = response.shopPayPaymentRequestSessionSubmit.paymentRequestReceipt.token;
    });

    return { fieldErrors: fieldErrors, serverErrors: serverErrors, error: false };
}

exports.Handle = Handle;
exports.Authorize = Authorize;
