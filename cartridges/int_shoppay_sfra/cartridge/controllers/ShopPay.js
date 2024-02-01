'use strict';

/**
 * @namespace ShopPay
 */

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');
var shoppayGlobalRefs = require('*/cartridge/scripts/shoppayGlobalRefs');
var collections = require('*/cartridge/scripts/util/collections');

function validateInputs(req, currentBasket, inputParams) {
    if (!currentBasket
        || (currentBasket.productLineItems.length == 0 && currentBasket.giftCertificateLineItems.length == 0)
    ) {
        return {
            error: true,
            errorMsg: Resource.msg('info.cart.empty.msg', 'cart', null)
        };
    }

    var shoppayEligible = shoppayGlobalRefs.shoppayApplicable(req, currentBasket);;
    if (!shoppayEligible) {
        return {
            error: true,
            errorMsg: Resource.msg('shoppay.cart.ineligible', 'shoppay', null)
        };
    }

    var missingInput;

    switch (req.httpMethod) {
        case 'GET':
            missingInput = inputParams.find(function (param){
                return req.httpParameterMap[param].empty;
            });
            break;
        case 'POST':
            const body = JSON.parse(req.body);
            missingInput = inputParams.find(function (param){
                return body[param] === undefined;
            });
            break;
    
        default:
            break;
    }

    if (missingInput) {
        return {
            error: true,
            errorMsg: Resource.msg('shoppay.input.error.missing', 'shoppay', null)
        }
    }

    return {
        error: false,
        errorMsg: null
    }
}

/**
 * The ShopPay-GetCartSummary controller generates the payment request object for use with Shop Pay checkout and
 * payments
 * @name Base/ShopPay-GetCartSummary
 * @function
 * @memberOf ShopPay
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {category} - sensitive
 * @param {renders} - json
 * @param {serverfunction} - get
 */
server.get('GetCartSummary', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var PaymentRequestModel = require('*/cartridge/models/paymentRequest');

    var currentBasket = BasketMgr.getCurrentBasket();

    if (!currentBasket
        || (currentBasket.productLineItems.length == 0 && currentBasket.giftCertificateLineItems.length == 0)
    ) {
        res.json({
            error: true,
            errorMsg: Resource.msg('info.cart.empty.msg', 'cart', null),
            paymentRequest: null
        });
        return next();
    }

    var shoppayEligible = shoppayGlobalRefs.shoppayApplicable(req, currentBasket);;
    if (!shoppayEligible) {
        res.json({
            error: true,
            errorMsg: Resource.msg('shoppay.cart.ineligible', 'shoppay', null),
            paymentRequest: null
        });
        return next();
    }

    try {
        var paymentRequestModel = new PaymentRequestModel(currentBasket);
    } catch (e) {
        logger.error('[ShopPay-GetCartSummary] error: \n\r' + e.message + '\n\r' + e.stack);
        res.json({
            error: true,
            errorMsg: e.message,
            paymentRequest: paymentRequestModel
        });
        return next();
    }

    res.json({
        error: false,
        errorMsg: null,
        paymentRequest: paymentRequestModel
    });
    next();
});

/**
 * The ShopPay-BeginSession controller initializes the Shop Pay payment request session with the
 * Shop Pay GraphQL API and returns the data needed to verify the Shop Pay session client-side.
 * @name Base/ShopPay-BeginSession
 * @function
 * @memberOf ShopPay
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {category} - sensitive
 * @param {renders} - json
 * @param {serverfunction} - post
 */
server.post('BeginSession', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket = BasketMgr.getCurrentBasket();

    var inputValidation = validateInputs(req, currentBasket, ['paymentRequest']);
    if (!inputValidation || inputValidation.error) {
        res.json({
            error: true,
            errorMsg: inputValidation.errorMsg
        });
        return next();
    }

    var data = JSON.parse(req.body);

    if (!currentBasket
        || (currentBasket.productLineItems.length == 0 && currentBasket.giftCertificateLineItems.length == 0)
    ) {
        res.json({
            error: true,
            errorMsg: Resource.msg('info.cart.empty.msg', 'cart', null)
        });
        return next();
    }

    var shoppayEligible = shoppayGlobalRefs.shoppayApplicable(req, currentBasket);;
    if (!shoppayEligible) {
        res.json({
            error: true,
            errorMsg: Resource.msg('shoppay.cart.ineligible', 'shoppay', null)
        });
        return next();
    }

    var paymentRequest = data.paymentRequest;
    if (!paymentRequest) {
        res.json({
            error: true,
            errorMsg: Resource.msg('shoppay.input.error.missing', 'shoppay', null),
        });
        return next();
    }

    var storefrontAPI = require('*/cartridge/scripts/shoppay/storefrontAPI');
    var response = storefrontAPI.shopPayPaymentRequestSessionCreate(currentBasket, paymentRequest);
    if (!response
        || response.error
        || !response.shopPayPaymentRequestSessionCreate
        || response.shopPayPaymentRequestSessionCreate.userErrors.length > 0
    ) {
        res.json({
            error: true,
            errorMsg: Resource.msg('shoppay.service.error', 'shoppay', null),
        });
        return next();
    }
    var paymentRequestSession = response.shopPayPaymentRequestSessionCreate.shopPayPaymentRequestSession;

    res.json({
        error: false,
        errorMsg: null,
        checkoutUrl: paymentRequestSession.checkoutUrl,
        sourceIdentifier: paymentRequestSession.sourceIdentifier,
        token: paymentRequestSession.token
    });
    next();
});

/**
 * The ShopPay-DiscountCodeChanged controller updates current basket with the sate of discount codes form ShopPay event
 * listener event.
 * @name Base/ShopPay-DiscountCodeChanged
 * @function
 * @memberOf ShopPay
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {category} - sensitive
 * @param {renders} - json
 * @param {serverfunction} - post
 */
server.post('DiscountCodeChanged', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var BasketMgr = require('dw/order/BasketMgr');
    var PaymentRequestModel = require('*/cartridge/models/paymentRequest');
    var currentBasket = BasketMgr.getCurrentBasket();

    var data = JSON.parse(req.body);

    var inputValidation = validateInputs(req, currentBasket, ['discountCodes']);
    if (!inputValidation || inputValidation.error) {
        res.json({
            error: true,
            errorMsg: inputValidation.errorMsg
        });
        return next();
    }

    var discountCodes = data.discountCodes;
    var discountCodesToAdd = [];
    var discountCodesToRemove = [];

    collections.forEach(currentBasket.couponLineItems, function (item) {
        if(!discountCodes[item.couponCode]) {
            discountCodesToRemove.push(item.couponCode);
        }
    });

    discountCodes.forEach(function (code) {
        const couponLineItem = collections.find(currentBasket.couponLineItems, function (item) {
            return item.couponCode === code
        });
        if(couponLineItem === null) {
            discountCodesToAdd.push(code)
        }
    });

    if (discountCodesToAdd.length) {
        discountCodesToAdd.forEach(function (code) {
            Transaction.wrap(function () {
                currentBasket.createCouponLineItem(code, true);
            });
        });
    }

    if (discountCodesToRemove.length) {
        discountCodesToRemove.forEach(function (code) {
            const couponLineItem = collections.find(currentBasket.couponLineItems, function (item) {
                return item.couponCode === code;
            });
            Transaction.wrap(function () {
                currentBasket.removeCouponLineItem(couponLineItem);
            });
        });
    }

    var paymentRequestModel = new PaymentRequestModel(currentBasket);
     
    res.json({
        error: false,
        errorMsg: null,
        paymentRequest: paymentRequestModel
    });
    next();
});

/**
 * The ShopPay-ShippingAddressChanged controller updates current basket with the shipping address form ShopPay event
 * listener event.
 * @name Base/ShopPay-ShippingAddressChanged
 * @function
 * @memberOf ShopPay
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {category} - sensitive
 * @param {renders} - json
 * @param {serverfunction} - post
 */
server.post('ShippingAddressChanged', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var Transaction = require('dw/system/Transaction');
    var PaymentRequestModel = require('*/cartridge/models/paymentRequest');
    var currentBasket = BasketMgr.getCurrentBasket();

    var data = JSON.parse(req.body);

    var inputValidation = validateInputs(req, currentBasket, ['shippingAddress']);
    if (!inputValidation || inputValidation.error) {
        res.json({
            error: true,
            errorMsg: inputValidation.errorMsg
        });
        return next();
    }

    var shipment = currentBasket.defaultShipment;
    if (!shipment) {
        // Shipment required to complete express checkout
        res.json({
            status: 'fail'
        });
        return next();
    }

    Transaction.wrap(function () {
        // Get or create shipment shipping address
        var shippingAddress = shipment.shippingAddress;
        if (!shippingAddress) {
            shippingAddress = shipment.createShippingAddress();
        }

        var name = data.shippingAddress.firstName + ' ' + data.shippingAddress.lastName;
        if (name) {
            // Update shopper name in basket
            currentBasket.customerName = name;

            shippingAddress.firstName = data.shippingAddress.firstName;
            shippingAddress.lastName = data.shippingAddress.lastName;
        }

        // Copy shipping contact information to shipping address
        shippingAddress.address1 = data.shippingAddress.address1;
        shippingAddress.address2 = data.shippingAddress.address2;
        shippingAddress.city = data.shippingAddress.city;
        shippingAddress.stateCode = data.shippingAddress.provinceCode;
        shippingAddress.postalCode = data.shippingAddress.postalCode;
        shippingAddress.countryCode = data.shippingAddress.country;
    });

    var paymentRequestModel = new PaymentRequestModel(currentBasket);
     
    res.json({
        error: false,
        errorMsg: null,
        paymentRequest: paymentRequestModel
    });
    next();
});

/**
 * The ShopPay-DeliveryMethodChanged controller updates current basket with the selected dilevery method form ShopPay event
 * listener event.
 * @name Base/ShopPay-DeliveryMethodChanged
 * @function
 * @memberOf ShopPay
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {category} - sensitive
 * @param {renders} - json
 * @param {serverfunction} - post
 */
server.post('DeliveryMethodChanged', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var SalesforcePaymentRequest = require('dw/extensions/payments/SalesforcePaymentRequest');
    var Transaction = require('dw/system/Transaction');
    var PaymentRequestModel = require('*/cartridge/models/paymentRequest');
    var currentBasket = BasketMgr.getCurrentBasket();
    var shoppayHelper = require('*/cartridge/scripts/shoppay/helpers/shoppayHelpers.js');
    var shippingHelpers = require('*/cartridge/scripts/checkout/shippingHelpers');

    var data = JSON.parse(req.body);

    var inputValidation = validateInputs(req, currentBasket, ['shippingLines']);
    if (!inputValidation || inputValidation.error) {
        res.json({
            error: true,
            errorMsg: inputValidation.errorMsg
        });
        return next();
    }

    var shipment = currentBasket.defaultShipment;
    if (!shipment) {
        // Shipment required to complete express checkout
        res.json({
            status: 'fail'
        });
        return next();
    }

    // Find shipping method for selected shipping option
    var applicableShippingMethods = shippingHelpers.getApplicableShippingMethods(shipment);
    var shippingMethod = shoppayHelper.findShippingMethod(applicableShippingMethods, data.shippingLines[0].code);

    if (!shippingMethod) {
        // Shopper selected a shipping method that is not applicable
        res.json({
            status: 'fail'
        });
        return next();
    }

    Transaction.wrap(function () {
        // Set selected shipping method
        shippingHelpers.selectShippingMethod(shipment, shippingMethod.ID);
    });

    var paymentRequestModel = new PaymentRequestModel(currentBasket);

    res.json({
        error: false,
        errorMsg: null,
        paymentRequest: paymentRequestModel
    });
    next();
});

server.post('SubmitPayment', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var BasketMgr = require('dw/order/BasketMgr');
    var HookMgr = require('dw/system/HookMgr');
    var PaymentMgr = require('dw/order/PaymentMgr');
    var currentBasket = BasketMgr.getCurrentBasket();
    if (!currentBasket
        || (currentBasket.productLineItems.length == 0 && currentBasket.giftCertificateLineItems.length == 0)
    ) {
        res.json({
            error: true,
            errorMsg: Resource.msg('info.cart.empty.msg', 'cart', null)
        });
        return next();
    }

    var shoppayEligible = shoppayGlobalRefs.shoppayApplicable(req, currentBasket);;
    if (!shoppayEligible) {
        res.json({
            error: true,
            errorMsg: Resource.msg('shoppay.cart.ineligible', 'shoppay', null)
        });
        return next();
    }

    var paymentRequestInput = req.httpParameterMap['paymentRequest'];
    var tokenInput = req.httpParameterMap['token'];
    var paymentRequest = paymentRequestInput.empty ? null : JSON.parse(paymentRequestInput.value);
    var token = tokenInput.empty ? null : tokenInput.value;
    if (!paymentRequest || !token) {
        res.json({
            error: true,
            errorMsg: Resource.msg('shoppay.input.error.missing', 'shoppay', null),
        });
        return next();
    }

    // Kristin TODO: Add missing place order logic, etc. and flesh out the logic below
    var paymentMethodId = shoppayGlobalRefs.shoppayPaymentMethodId;
    var paymentProcessor = PaymentMgr.getPaymentMethod(paymentMethodId).paymentProcessor;
    var authorizationResult;

    if (HookMgr.hasHook('app.payment.processor.' + paymentProcessor.ID.toLowerCase())) {
        authorizationResult = HookMgr.callHook(
            'app.payment.processor.' + paymentProcessor.ID.toLowerCase(),
            'Authorize',
            paymentRequest,
            token
        );
    } else {
        authorizationResult = HookMgr.callHook(
            'app.payment.processor.default',
            'Authorize'
        );
    }
    if (authorizationResult.error) {
        res.json({
            error: true,
            errorMsg: authorizationResult.serverErrors.length > 0 ? authorizationResult.serverErrors[0] : authorizationResults.fieldErrors[0]
        });
        return next();
    }
    // Kristin TODO: Add missing place order logic

    // Kristin TODO: Update payment response to use dynamic order attributes
    res.json({
        error: false,
        errorMsg: null,
        orderID: "ABC123",
        orderToken: "CBA321",
        continueUrl: URLUtils.url('Order-Confirm').toString(),
    })
    next();
});

module.exports = server.exports();
