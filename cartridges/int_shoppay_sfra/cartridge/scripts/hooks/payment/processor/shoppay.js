'use strict';

var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var collections = require('*/cartridge/scripts/util/collections');
var shoppayGlobalRefs = require('*/cartridge/scripts/shoppayGlobalRefs');

/**
 * If the information is valid a Shop Pay payment instrument is created.
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

        // Split payments, including partial payment with gift cards, are not supported by the Shop Pay modal
        // so the transaction amount will always be the total gross price of the basket
        var paymentInstrument = basket.createPaymentInstrument(
            shoppayGlobalRefs.shoppayPaymentMethodId, basket.totalGrossPrice
        );
        basket.custom.shoppaySourceIdentifier = basket.UUID;
    });

    return { fieldErrors: [], serverErrors: serverErrors, error: false };
}

/**
 * Authorizes a payment using Shop Pay
 * @param
 * @return {Object} an object that contains error information
 */
function Authorize(paymentRequest, token, paymentInstrument) {
    var serverErrors = [];
    var fieldErrors = {};
    var error = false;
    var storefrontAPI = require('*/cartridge/scripts/shoppay/storefrontAPI');
    var response = storefrontAPI.shopPayPaymentRequestSessionSubmit(paymentRequest, token);
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
