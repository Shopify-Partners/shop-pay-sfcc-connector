'use strict';

var discountHelpers = require('*/cartridge/scripts/shoppay/helpers/discountHelpers');
var paymentHelpers = require('*/cartridge/scripts/shoppay/helpers/paymentHelpers');
var productLineItemHelpers = require('*/cartridge/scripts/shoppay/helpers/productLineItemHelpers');
var shippingHelpers = require('*/cartridge/scripts/shoppay/helpers/shippingHelpers');
var totalsHelpers = require('*/cartridge/scripts/shoppay/helpers/totalsHelpers');

/**
 * @constructor
 * @classdesc class that represents a Shop Pay payment request object
 *
 * @param {dw.order.LineItemCtnr} basket - the current line item container
 */
function PaymentRequest(basket) {

    var mainShipment = shippingHelpers.getPrimaryShipment(basket);
    var paymentMethod = paymentHelpers.getPaymentMethod();
    var totalShippingPrice = totalsHelpers.getTotalShippingPrice();

    this.shippingAddress = shippingHelpers.getShippingAddress(mainShipment);
    if (paymentMethod != null) {
        this.paymentMethod = paymentMethod;
    }
    this.discountCodes = discountHelpers.getDiscountCodes();
    this.lineItems = productLineItemHelpers.getLineItems();
    this.shippingLines = shippingHelpers.getShippingLines(basket);
    this.deliveryMethods = shippingHelpers.getApplicableDeliveryMethods();
    this.locale = paymentHelpers.getLocale();
    this.presentmentCurrency = paymentHelpers.getPresentmentCurrency();
    this.subtotal = totalsHelpers.getSubtotal();
    this.discounts = discountHelpers.getDiscounts();
    if (totalShippingPrice && Object.keys(totalShippingPrice).length > 0) {
        this.totalShippingPrice = totalShippingPrice;
    }
    this.totalTax = totalsHelpers.getTotalTax();
    this.total = totalsHelpers.getTotal();

}

module.exports = PaymentRequest;
