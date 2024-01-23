'use strict';

var URLUtils = require('dw/web/URLUtils');
var PaymentMgr = require('dw/order/PaymentMgr');
var currentSite = require('dw/system/Site').current;

const shoppayPaymentMethodId = 'ShopPay';

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
    var paymentMethod = PaymentMgr.getPaymentMethod(shoppayPaymentMethodId);
    return (paymentMethod) ? paymentMethod.isActive() : false;
};

// shortcut references to individual Shop Pay site preference values
var isShoppayPDPButtonEnabled   = function() { return currentSite.getCustomPreferenceValue('shoppayPDPButtonEnabled'); }
var isShoppayCartButtonEnabled  = function() { return currentSite.getCustomPreferenceValue('shoppayCartButtonEnabled'); }
var shoppayStoreId              = function() { return currentSite.getCustomPreferenceValue('shoppayStoreId'); }
var shoppayClientId              = function() { return currentSite.getCustomPreferenceValue('shoppayClientId'); }
var shoppayAdminAPIVersion      = function() { return currentSite.getCustomPreferenceValue('shoppayAdminAPIVersion'); }
var shoppayStorefrontAPIVersion = function() { return currentSite.getCustomPreferenceValue('shoppayStorefrontAPIVersion'); }
var shoppayModalImageViewType   = function() { return currentSite.getCustomPreferenceValue('shoppayModalImageViewType'); }

/**
 * Core reference for whether the Shop Pay payment method is valid based on payment amount,
 * country / regions, customer group, cart contents, etc.
 * @param {Object} req
 * @param {dw.order.Basket} currentBasket
 * @returns {boolean} true if the cart is eligible for checkout with Shop Pay payment, otherwise false
 */
function shoppayApplicable(req, currentBasket) {
    var shoppayPaymentMethod = PaymentMgr.getPaymentMethod(shoppayPaymentMethodId);
    var paymentAmount = currentBasket.totalGrossPrice.value;
    var countryCode = req.geolocation.countryCode;
    var currentCustomer = req.currentCustomer.raw;
    var applicablePaymentMethods = PaymentMgr.getApplicablePaymentMethods(
        currentCustomer,
        countryCode,
        paymentAmount
    );
    var eligible = true;
    var message = null;
    var shippingHelpers = require('*/cartridge/scripts/shoppay/helpers/shippingHelpers');
    var hasIneligibleShipments = shippingHelpers.hasIneligibleShipments(currentBasket);

    return !hasIneligibleShipments && applicablePaymentMethods.contains(shoppayPaymentMethod);
}

/**
 * Core reference for whether to include the Shop Pay script tag and JS on a specific page
 * based on site preferences, payment method enablement, etc.
 * Note that these elements may be needed on a page such as PDP or cart where a customer's
 * eligibility for Shop Pay may change as the cart is updated via Ajax, so the code to support
 * Shop Pay should still need to be included.
 * @param {string} context - A string representing the page context ['pdp', 'cart', 'checkout']
 * @returns {boolean} true if Shop Pay elements should be included on the page, otherwise false
 */
function shoppayElementsApplicable(context) {
    var showShoppayButton = false;
    switch (context) {
        case 'pdp':
            if (isShoppayPDPButtonEnabled() && shoppayEnabled()) {
                showShoppayButton = true;
            }
            break;
        case 'cart':
            if (isShoppayCartButtonEnabled() && shoppayEnabled()) {
                showShoppayButton = true;
            }
            break;
        case 'checkout':
            if (shoppayEnabled()) {
                showShoppayButton = true;
            }
            break;
        default:
            break;
    }

    return showShoppayButton;
}

/*
 add any values you want made available to client-side JS to the object below.
 then, in controller, add:
    res.viewData.shoppayClientRefs = JSON.stringify(shoppayGlobalRefs.getClientRefs);
 then, in ISML add:
    <script>
        window.shoppayClientRefs = JSON.parse('<isprint encoding="jsonvalue" value="${pdict.shoppayClientRefs}" />');
    </script>
*/
/**
 * Add csrf token param to url
 * @param {boolean || undefined} initShopPayEmailRecognition - should email recognition be initialized
 * @returns {object} - js client refs
 */
var getClientRefs = function(initShopPayEmailRecognition) {
    return {
        urls: urls,
        constants: {
            shoppayEnabled: shoppayEnabled(),
            initShopPayEmailRecognition: initShopPayEmailRecognition || false
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
}


module.exports = {
    shoppayEnabled: shoppayEnabled,
    shoppayApplicable: shoppayApplicable,
    shoppayElementsApplicable: shoppayElementsApplicable,
    isShoppayPDPButtonEnabled: isShoppayPDPButtonEnabled(),
    isShoppayCartButtonEnabled: isShoppayCartButtonEnabled(),
    shoppayStoreId: shoppayStoreId(),
    shoppayAdminAPIVersion: shoppayAdminAPIVersion(),
    shoppayStorefrontAPIVersion: shoppayStorefrontAPIVersion(),
    shoppayModalImageViewType: shoppayModalImageViewType(),
    getClientRefs: getClientRefs,
    shoppayPaymentMethodId: shoppayPaymentMethodId
};
