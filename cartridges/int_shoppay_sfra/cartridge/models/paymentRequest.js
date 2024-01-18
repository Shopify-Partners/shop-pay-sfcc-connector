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
    if (!basket) {
        return;
    }

    // The home delivery shipment or the first e-delivery shipment if only digital items in the basket
    var mainShipment = shippingHelpers.getPrimaryShipment(basket);
    if (!mainShipment) {
        return;
    }

    var paymentMethod = paymentHelpers.getPaymentMethod(basket);
    var totalShippingPrice = totalsHelpers.getTotalShippingPrice(basket);

    this.shippingAddress = shippingHelpers.getShippingAddress(mainShipment);
    if (paymentMethod != null) {
        this.paymentMethod = paymentMethod;
    }
    this.discountCodes = discountHelpers.getDiscountCodes(basket);
    this.lineItems = productLineItemHelpers.getLineItems(basket);
    this.shippingLines = shippingHelpers.getShippingLines(mainShipment);
    this.deliveryMethods = shippingHelpers.getApplicableDeliveryMethods(mainShipment);
    this.locale = paymentHelpers.getLocale();
    this.presentmentCurrency = paymentHelpers.getPresentmentCurrency(basket);
    this.subtotal = totalsHelpers.getSubtotal(basket);
    this.discounts = discountHelpers.getOrderDiscounts(basket);
    if (totalShippingPrice && Object.keys(totalShippingPrice).length > 0) {
        this.totalShippingPrice = totalShippingPrice;
    }
    this.totalTax = totalsHelpers.getTotalTax(basket);
    this.total = totalsHelpers.getTotal(basket);

}

module.exports = PaymentRequest;
