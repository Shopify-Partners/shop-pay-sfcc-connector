'use strict';

var URLUtils = require('dw/web/URLUtils');
var PaymentMgr = require('dw/order/PaymentMgr');
var ProductMgr = require('dw/catalog/ProductMgr');
var currentSite = require('dw/system/Site').current;

const shoppayPaymentMethodId = 'ShopPay';

var urls = {
    GetCartSummary: URLUtils.https('ShopPay-GetCartSummary').toString(),
    BeginSession: URLUtils.https('ShopPay-BeginSession').toString(),
    DiscountCodeChanged: URLUtils.https('ShopPay-DiscountCodeChanged').toString(),
    DeliveryMethodChanged: URLUtils.https('ShopPay-DeliveryMethodChanged').toString(),
    SubmitPayment: URLUtils.https('ShopPay-SubmitPayment').toString(),
    ShippingAddressChanged: URLUtils.https('ShopPay-ShippingAddressChanged').toString(),
    PrepareBasket: URLUtils.https('ShopPay-PrepareBasket').toString(),
    BuyNowData: URLUtils.https('ShopPay-BuyNowData').toString(),
};

// core reference for if Shop Pay is enabled, controlled by
// enabling or disabling the Shop Pay payment method
var shoppayEnabled = function() {
    var paymentMethod = PaymentMgr.getPaymentMethod(shoppayPaymentMethodId);
    return (paymentMethod) ? paymentMethod.isActive() : false;
};

/**
 * Considers both site preference and product-level PDP button toggles to determine whether
 * the Shop Pay button should be present on a given PDP.
 * @param {string} productId - productID of the SFCC product for PDP context (optional)
 * @returns {boolean} true if the PDP Shop Pay button is enabled, otherwise false
 */
var isShoppayPDPButtonEnabled = function(productId) {
    var isEnabled = false;
    if (currentSite.getCustomPreferenceValue('shoppayPDPButtonEnabled')) {
        isEnabled = true;
    } else if (productId != null) {
        var product = ProductMgr.getProduct(productId);
        if (product
            && product.custom.shoppayPDPButtonEnabled
            && !product.productSet
        ) {
            isEnabled = true;
        }
    }
    return isEnabled;
}

// shortcut references to individual Shop Pay site preference values
var isShoppayCartButtonEnabled  = function() { return currentSite.getCustomPreferenceValue('shoppayCartButtonEnabled'); }
var shoppayStoreId              = function() { return currentSite.getCustomPreferenceValue('shoppayStoreId'); }
var shoppayClientId             = function() { return currentSite.getCustomPreferenceValue('shoppayClientId'); }
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
        /* TODO: Consider changing this to check merchanidise + gift certificate total in case shipping is not
    yet assigned. OOTB assigns shipping method at add to cart, but customer may have customized? */
    var paymentAmount = 0;
    if (currentBasket) {
        paymentAmount = currentBasket.totalGrossPrice.value;
    }
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
    var hasIneligibleShipments = false;
    if (currentBasket) {
        hasIneligibleShipments = shippingHelpers.hasIneligibleShipments(currentBasket);
    }

    return !hasIneligibleShipments && applicablePaymentMethods.contains(shoppayPaymentMethod);
}

/**
 * Core reference for whether to include the Shop Pay script tag and JS on a specific page
 * based on site preferences, payment method enablement, etc.
 * Note that these elements may be needed on a page such as PDP or cart where a customer's
 * eligibility for Shop Pay may change as the cart is updated via Ajax, so the code to support
 * Shop Pay should still need to be included.
 * @param {string} context - A string representing the page context ['pdp', 'cart', 'checkout']
 * @param {string} productID - productID of the SFCC product for PDP context (optional)
 * @returns {boolean} true if Shop Pay elements should be included on the page, otherwise false
 */
function shoppayElementsApplicable(context, productId) {
    var showShoppayButton = false;
    switch (context) {
        case 'pdp':
            if (isShoppayPDPButtonEnabled(productId) && shoppayEnabled()) {
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
 * ---- @param {boolean || undefined} initShopPayEmailRecognition - should email recognition be initialized ---- (ORIGINAL COMMENT...REMOVE IN FAVOR OF CONTEXT INSTEAD ?????)
 * @param {string} productId - productID of the SFCC product for PDP context (optional)
 * @param {string} context - 'pdp', 'cart', or 'checkout' - used to set global constants in the window  --> (UPDATED COMMENT FROM POC BRANCH -- CONFIRM???)
 * @returns {object} - js client refs
 */

// ================================= FUNC PARAMS ON DEVELOP BRANCH. CONFIRM BEFORE REMOVING (???) =================================
// var getClientRefs = function(initShopPayEmailRecognition, productId) {
// ================================================================================================================================

var getClientRefs = function(context, productId) {
    let test = context;
    let testTwo = productId;
    return {
        urls: urls,
        constants: {
            shoppayEnabled: shoppayEnabled(),
            // initShopPayEmailRecognition: initShopPayEmailRecognition || false, // FROM ORIGINAL DEVELOP BRANCH. CONFIRM BEFORE REMOVING (???)
            initShopPayEmailRecognition: context === 'checkout',
            isBuyNow: context === 'pdp'
        },
        preferences: {
            shoppayPDPButtonEnabled: isShoppayPDPButtonEnabled(productId),
            shoppayCartButtonEnabled: isShoppayCartButtonEnabled(),
            shoppayStoreId: shoppayStoreId(),
            shoppayClientId: shoppayClientId()
        }
    }
}


module.exports = {
    shoppayEnabled: shoppayEnabled,
    shoppayApplicable: shoppayApplicable,
    shoppayElementsApplicable: shoppayElementsApplicable,
    isShoppayPDPButtonEnabled: isShoppayPDPButtonEnabled,
    isShoppayCartButtonEnabled: isShoppayCartButtonEnabled(),
    shoppayStoreId: shoppayStoreId(),
    shoppayAdminAPIVersion: shoppayAdminAPIVersion(),
    shoppayStorefrontAPIVersion: shoppayStorefrontAPIVersion(),
    shoppayModalImageViewType: shoppayModalImageViewType(),
    getClientRefs: getClientRefs,
    shoppayPaymentMethodId: shoppayPaymentMethodId
};
