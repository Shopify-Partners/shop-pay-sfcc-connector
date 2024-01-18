'use strict';

var URLUtils = require('dw/web/URLUtils');
var PaymentMgr = require('dw/order/PaymentMgr');
var currentSite = require('dw/system/Site').current;

var urls = {
    GetCartSummary: URLUtils.https('ShopPay-GetCartSummary').toString(),
    BeginSession: URLUtils.https('ShopPay-BeginSession').toString(),
    DiscountCodeChanged: URLUtils.https('ShopPay-DiscountCodeChanged').toString(),
    DeliveryMethodChanged: URLUtils.https('ShopPay-DeliveryMethodChanged').toString(),
    SubmitPayment: URLUtils.https('ShopPay-SubmitPayment').toString()
};

// core reference for if Shop Pay is enabled, controlled by
// enabling or disabling the Shop Pay payment method
var shoppayEnabled = function() {
    var paymentMethod = PaymentMgr.getPaymentMethod('ShopPay');
    return (paymentMethod) ? paymentMethod.isActive() : false;
};

// Kristin TODO: flesh this logic out
// core reference for if the Shop Pay payment method is valid based on
// payment amount, country / regions, customer group, etc
function shoppayApplicable() { // req, currentBasket
    // var paymentAmount = currentBasket.totalGrossPrice.value;
    // var countryCode = req.geolocation.countryCode;
    // var currentCustomer = req.currentCustomer.raw;
    // return PaymentMgr.getApplicablePaymentMethods(
    //     currentCustomer,
    //     countryCode,
    //     paymentAmount
    // );
    return true;
}

// shortcut references to individual Shop Pay site preference values
var isShoppayPDPButtonEnabled   = function() { return currentSite.getCustomPreferenceValue('shoppayPDPButtonEnabled'); }
var isShoppayCartButtonEnabled  = function() { return currentSite.getCustomPreferenceValue('shoppayCartButtonEnabled'); }
var shoppayStoreId              = function() { return currentSite.getCustomPreferenceValue('shoppayStoreId'); }
var shoppayClientId              = function() { return currentSite.getCustomPreferenceValue('shoppayClientId'); }
var shoppayAdminAPIVersion      = function() { return currentSite.getCustomPreferenceValue('shoppayAdminAPIVersion'); }
var shoppayStorefrontAPIVersion = function() { return currentSite.getCustomPreferenceValue('shoppayStorefrontAPIVersion'); }


/*
 add any values you want made available to client-side JS to the object below.
 then, in controller, add:
    res.viewData.shoppayClientRefs = JSON.stringify(shoppayGlobalRefs.clientRefs);
 then, in ISML add:
    <script>
        window.shoppayClientRefs = JSON.parse('<isprint encoding="jsonvalue" value="${pdict.shoppayClientRefs}" />');
    </script>
*/
var clientRefs = {
    urls: urls,
    constants: {
        shoppayEnabled: shoppayEnabled(),
    },
    preferences: {
        shoppayPDPButtonEnabled: isShoppayPDPButtonEnabled(),
        shoppayCartButtonEnabled: isShoppayCartButtonEnabled(),
        shoppayStoreId: shoppayStoreId(),
        shoppayClientId: shoppayClientId(),
        shoppayAdminAPIToken: shoppayAdminAPIVersion(),
        shoppayStorefrontAPIToken: shoppayStorefrontAPIVersion()
    }
}


module.exports = {
    shoppayEnabled: shoppayEnabled,
    shoppayApplicable: shoppayApplicable,
    isShoppayPDPButtonEnabled: isShoppayPDPButtonEnabled(),
    isShoppayCartButtonEnabled: isShoppayCartButtonEnabled(),
    shoppayStoreId: shoppayStoreId(),
    shoppayAdminAPIVersion: shoppayAdminAPIVersion(),
    shoppayStorefrontAPIVersion: shoppayStorefrontAPIVersion(),
    clientRefs: clientRefs
};