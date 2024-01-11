'use strict';

var URLUtils = require('dw/web/URLUtils');
var PaymentMgr = require('dw/order/PaymentMgr');

var urls = {
    GetCartSummary: URLUtils.https('ShopPay-GetCartSummary').toString(),
    BeginSession: URLUtils.https('ShopPay-BeginSession').toString(),
    DiscountCodeChanged: URLUtils.https('ShopPay-DiscountCodeChanged').toString(),
    DeliveryMethodChanged: URLUtils.https('ShopPay-DeliveryMethodChanged').toString(),
    SubmitPayment: URLUtils.https('ShopPay-SubmitPayment').toString()
};

// aidrian TODO: fine to just check if enabled, or do we want to
// use PaymentMgr.getApplicablePaymentMethods here?
var shoppayEnabled = function() {
    var paymentMethod = PaymentMgr.getPaymentMethod('ShopPay');
    return (paymentMethod) ? paymentMethod.isActive() : false;
};

module.exports = {
    urls: urls,
    shoppayEnabled: shoppayEnabled
};