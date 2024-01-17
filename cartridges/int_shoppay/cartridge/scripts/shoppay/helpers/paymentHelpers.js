'use strict';

/**
 * Gets the Shop Pay payment token from the Shop Pay payment instrument, if it exists
 * @param {dw.order.LineItemCtnr} order - the current line item container
 * @returns {string} the Shop Pay payment token
 */
function getPaymentMethod(order) {
    var paymentMethod = null;
    if (order.paymentInstruments && order.paymentInstruments.length == 1) {
        // Shop Pay cannot be used in split payment scenarios, not even with EGC, so it will have one payment instrument
        var shoppayPaymentMethodId = require('*/cartridge/scripts/shoppayGlobalRefs').shoppayPaymentMethodId;
        var PaymentMgr = require('dw/order/PaymentMgr');

        var orderPI = order.paymentInstruments[0];
        var shoppayPaymentMethod = PaymentMgr.getPaymentMethod(shoppayPaymentMethodId);
        var paymentProcessorID = orderPI.paymentTransaction && orderPI.paymentTransaction.paymentProcessor ? orderPI.paymentTransaction.paymentProcessor.ID : null;
        if (paymentProcessorID == shoppayPaymentMethod.paymentProcessor.ID && 'shoppayPaymentToken' in orderPI.custom) {
            paymentMethod = orderPI.custom.shoppayPaymentToken;
        }
    }
    return paymentMethod;
}

/**
 * Gets the 2-digit language code for the current session from the site's locale
 * @returns {string} the 2-digit language code for the customer's storefront session
 */
function getLocale() {
    var Locale = require('dw/util/Locale');
    var Site = require('dw/system/Site');
    var currentLocale = Locale.getLocale(request.locale);
    // If locale = "default"
    if (!currentLocale.language) {
        var defaultLocale = Site.getCurrent().getDefaultLocale();
        currentLocale = Locale.getLocale(defaultLocale);
    }

    return currentLocale.getLanguage();
}

/**
 * Gets the 3-digit ISO currency code for the customer's basket
 * @param {dw.order.LineItemCtnr} basket - the current line item container
 * @returns {string} the 3-digit ISO currency code for the basket
 */
function getPresentmentCurrency(basket) {
    if (!basket) {
        return session.currency.currencyCode;
    }
    return basket.currencyCode;
}

module.exports = {
    getPaymentMethod: getPaymentMethod,
    getLocale: getLocale,
    getPresentmentCurrency: getPresentmentCurrency
};
