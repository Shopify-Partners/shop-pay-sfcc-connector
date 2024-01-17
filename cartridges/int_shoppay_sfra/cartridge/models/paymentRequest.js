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

    // Kristin TODO: Add basket check and return... {}?

    var mainShipment = shippingHelpers.getPrimaryShipment(basket);
    var paymentMethod = paymentHelpers.getPaymentMethod(basket);
    var totalShippingPrice = totalsHelpers.getTotalShippingPrice(basket);

    this.shippingAddress = shippingHelpers.getShippingAddress(mainShipment);
    if (paymentMethod != null) {
        this.paymentMethod = paymentMethod;
    }
    this.discountCodes = discountHelpers.getDiscountCodes(basket);
    this.lineItems = productLineItemHelpers.getLineItems(basket);
    this.shippingLines = shippingHelpers.getShippingLines(basket);
    this.deliveryMethods = shippingHelpers.getApplicableDeliveryMethods(mainShipment);
    this.locale = paymentHelpers.getLocale();
    this.presentmentCurrency = paymentHelpers.getPresentmentCurrency(basket);
    this.subtotal = totalsHelpers.getSubtotal(basket);
    this.discounts = discountHelpers.getDiscounts(basket);
    if (totalShippingPrice && Object.keys(totalShippingPrice).length > 0) {
        this.totalShippingPrice = totalShippingPrice;
    }
    this.totalTax = totalsHelpers.getTotalTax(basket);
    this.total = totalsHelpers.getTotal(basket);

}

module.exports = PaymentRequest;
