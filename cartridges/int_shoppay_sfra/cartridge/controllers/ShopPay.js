'use strict';

/**
 * @namespace ShopPay
 */

var server = require('server');

/* Middleware */
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

/* Script Modules */
var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
var collections = require('*/cartridge/scripts/util/collections');
var shippingHelpers = require('*/cartridge/scripts/checkout/shippingHelpers');
var shoppayCheckoutHelpers = require('*/cartridge/scripts/shoppay/helpers/shoppayCheckoutHelpers');
var shoppayGlobalRefs = require('*/cartridge/scripts/shoppayGlobalRefs');

/* API Includes */
var BasketMgr = require('dw/order/BasketMgr');
var Logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');
var PaymentRequestModel = require('*/cartridge/models/paymentRequest');
var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var URLUtils = require('dw/web/URLUtils');

function validateInputs(req, currentBasket, inputParams) {
    if (!currentBasket
        || (currentBasket.productLineItems.length == 0 && currentBasket.giftCertificateLineItems.length == 0)
    ) {
        return {
            error: true,
            errorMsg: Resource.msg('info.cart.empty.msg', 'cart', null)
        };
    }

    var shoppayEligible = shoppayGlobalRefs.shoppayApplicable(req, currentBasket);
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
    var currentBasket;
    var httpParameterMap = req.httpParameterMap;
    if (req.httpParameterMap.basketId && req.httpParameterMap.basketId.value) {
        currentBasket = BasketMgr.getTemporaryBasket(req.httpParameterMap.basketId.value);
    }
    else {
        currentBasket = BasketMgr.getCurrentBasket();
    }

    var inputValidation = validateInputs(req, currentBasket, []);
    if (!inputValidation || inputValidation.error) {
        res.json({
            error: true,
            errorMsg: inputValidation.errorMsg,
            paymentRequest: null
        });
        return next();
    }

    try {
        var paymentRequestModel = new PaymentRequestModel(currentBasket);
    } catch (e) {
        Logger.error('[ShopPay-GetCartSummary] error: \n\r' + e.message + '\n\r' + e.stack);
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
 * The ShopPay-BuyNowData controller
 * listener event.
 * @name Base/ShopPay-BuyNowData
 * @function
 * @memberOf ShopPay
 */
server.post('BuyNowData', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var product = JSON.parse(req.body);
    var buyNowPaymentRequest = shoppayCheckoutHelpers.getBuyNowData(product);

    res.json({
        error: false,
        errorMsg: null,
        paymentRequest: buyNowPaymentRequest
    });
    next();
});

/**
 * The ShopPay-PrepareBasket controller
 * listener event.
 * @name Base/ShopPay-PrepareBasket
 * @function
 * @memberOf ShopPay
 */
server.post('PrepareBasket', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var basket = Transaction.wrap(shoppayCheckoutHelpers.createBuyNowBasket);
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var currentBasket;
    var paymentRequestModel;
    var product = JSON.parse(req.body);
    var result = shoppayCheckoutHelpers.addProductToTempBasket(product, basket);
    var ShippingMgr = require('dw/order/ShippingMgr');
    var shippingMethod = ShippingMgr.defaultShippingMethod;

    if (result.error) {
        Transaction.wrap(function() {
            BasketMgr.deleteTemporaryBasket(basket);
        });
        res.json({
            error: true,
            errorMsg: result.errorMsg,
            paymentRequest: null
        });
        return next();
    }

    Transaction.wrap(function () {
        try {
            // Set shipment shipping method
            shippingHelpers.selectShippingMethod(basket.defaultShipment, shippingMethod.ID);

            // Calculate basket
            basketCalculationHelpers.calculateTotals(basket);
        } catch (e) {
            BasketMgr.deleteTemporaryBasket(basket);
            res.json({
                error: true,
                errorMsg: e.message,
                paymentRequest: null
            });
            return next();
        }
    });

    try {
        paymentRequestModel = new PaymentRequestModel(basket);
    } catch (e) {
        Logger.error('[ShopPay-PrepareBasket] error: \n\r' + e.message + '\n\r' + e.stack);
        res.json({
            error: true,
            errorMsg: e.message,
            paymentRequest: null
        });
        return next();
    }

    res.json({
        error: false,
        errorMsg: null,
        basketId: basket.UUID,
        paymentRequest: paymentRequestModel
    });

    return next();
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
    var currentBasket;
    var inputs = JSON.parse(req.body);

    if (inputs.basketId) {
        currentBasket = BasketMgr.getTemporaryBasket(inputs.basketId);
    } else {
        currentBasket = BasketMgr.getCurrentBasket();
    }

    var inputValidation = validateInputs(req, currentBasket, ['paymentRequest']);
    if (!inputValidation || inputValidation.error) {
        res.json({
            error: true,
            errorMsg: inputValidation.errorMsg
        });
        return next();
    }

    var paymentRequest = inputs.paymentRequest;
    var storefrontAPI = require('*/cartridge/scripts/shoppay/storefrontAPI');
    var result = storefrontAPI.shoppayPaymentRequestSessionCreate(currentBasket, paymentRequest);

    if (!result
        || result.error
        || !result.shopPayPaymentRequestSessionCreate
        || result.shopPayPaymentRequestSessionCreate.userErrors.length > 0
        || result.shopPayPaymentRequestSessionCreate.shopPayPaymentRequestSession == null
    ) {
        res.json({
            error: true,
            errorMsg: Resource.msg('shoppay.service.error', 'shoppay', null),
        });
        return next();
    }
    var paymentRequestSession = result.shopPayPaymentRequestSessionCreate.shopPayPaymentRequestSession;

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
    var currentBasket;
    var data = JSON.parse(req.body);
    var PromotionMgr = require('dw/campaign/PromotionMgr');

    if (data.basketId) {
        currentBasket = BasketMgr.getTemporaryBasket(data.basketId);
    } else {
        currentBasket = BasketMgr.getCurrentBasket();
    }

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
        /*  If coupon code is valid and successfully added, but NO_APPLICABLE_PROMOTION, don't remove it. The Shop Pay
            modal won't know about these promotions, but if the customer closes the modal and returns to cart, the
            cart should still show the coupon has been added but "not applied". Similar text/flagging is not
            supported in the Shop Pay modal. */
        if (discountCodes.indexOf(item.couponCode) < 0 && item.applied) {
            discountCodesToRemove.push(item.couponCode);
        }
    });

    discountCodes.forEach(function (code) {
        const couponLineItem = collections.find(currentBasket.couponLineItems, function (item) {
            return item.couponCode === code;
        });
        if(couponLineItem === null) {
            discountCodesToAdd.push(code);
        }
    });

    var codeApplicationError = false;
    var errorMessage;
    if (discountCodesToAdd.length) {
        var couponLineItem;
        try {
            discountCodesToAdd.forEach(function (code) {
                Transaction.wrap(function () {
                    couponLineItem = currentBasket.createCouponLineItem(code, true);
                    PromotionMgr.applyDiscounts(currentBasket);
                });
                /*  remove coupon if it was successfully added but not applied (status code "NO_APPLICABLE_PROMOTION")
                    as the Shop Pay modal does not support the "not applied" text for the promo that SFCC cart uses. */
                if (!couponLineItem.applied) {
                    var statusCode = couponLineItem.statusCode;
                    errorMessage = Resource.msg('error.no.applicable.promotion', 'shoppay', null);
                    Transaction.wrap(function() {
                        currentBasket.removeCouponLineItem(couponLineItem);
                    });
                    throw new Error(statusCode);
                }
            });
        } catch (e) {
            // Invalid coupon code. Generate an appropriate error message for response, but continue processing.
            codeApplicationError = true;
            if (!errorMessage) {
                var errorCodes = {
                    COUPON_CODE_ALREADY_IN_BASKET: 'error.coupon.already.in.cart',
                    COUPON_ALREADY_IN_BASKET: 'error.coupon.cannot.be.combined',
                    COUPON_CODE_ALREADY_REDEEMED: 'error.coupon.already.redeemed',
                    COUPON_CODE_UNKNOWN: 'error.unable.to.add.coupon',
                    COUPON_DISABLED: 'error.unable.to.add.coupon',
                    REDEMPTION_LIMIT_EXCEEDED: 'error.unable.to.add.coupon',
                    TIMEFRAME_REDEMPTION_LIMIT_EXCEEDED: 'error.unable.to.add.coupon',
                    NO_ACTIVE_PROMOTION: 'error.unable.to.add.coupon',
                    NO_APPLICABLE_PROMOTION: 'error.no.applicable.promotion',
                    default: 'error.unable.to.add.coupon'
                };
                var errorMessageKey = errorCodes[e.errorCode] || errorCodes.default;
                errorMessage = Resource.msg(errorMessageKey, 'cart', null);
            }
        }
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

    COHelpers.recalculateBasket(currentBasket);
    var paymentRequestModel = new PaymentRequestModel(currentBasket);

    if (codeApplicationError) {
        res.json({
            error: true,
            errorMsg: errorMessage,
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
    var currentBasket;
    var data = JSON.parse(req.body);

    if (data.basketId) {
        currentBasket = BasketMgr.getTemporaryBasket(data.basketId);
    } else {
        currentBasket = BasketMgr.getCurrentBasket();
    }

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
            error: true,
            errorMsg: Resource.msg('shoppay.error.shipping', 'shoppay', null),
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
        }
        if (data.shippingAddress.email) {
            currentBasket.customerEmail = data.shippingAddress.email;
        }

        // Copy shipping contact information to shipping address
        shippingAddress.firstName = data.shippingAddress.firstName;
        shippingAddress.lastName = data.shippingAddress.lastName;
        shippingAddress.companyName = data.shippingAddress.companyName || "";
        shippingAddress.address1 = data.shippingAddress.address1;
        if (data.shippingAddress.address2) {
            shippingAddress.address2 = data.shippingAddress.address2;
        }
        shippingAddress.city = data.shippingAddress.city;
        shippingAddress.stateCode = data.shippingAddress.provinceCode;
        shippingAddress.postalCode = data.shippingAddress.postalCode;
        shippingAddress.countryCode = data.shippingAddress.countryCode;
        shippingAddress.phone = data.shippingAddress.phone;
    });

    COHelpers.recalculateBasket(currentBasket);
    var paymentRequestModel = new PaymentRequestModel(currentBasket);

    res.json({
        error: false,
        errorMsg: null,
        paymentRequest: paymentRequestModel
    });
    next();
});

/**
 * The ShopPay-DeliveryMethodChanged controller updates current basket with the selected delivery method form ShopPay event
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
    var array = require('*/cartridge/scripts/util/array');
    var currentBasket;
    var data = JSON.parse(req.body);
    var SalesforcePaymentRequest = require('dw/extensions/payments/SalesforcePaymentRequest');

    if (data.basketId) {
        currentBasket = BasketMgr.getTemporaryBasket(data.basketId);
    } else {
        currentBasket = BasketMgr.getCurrentBasket();
    }

    var inputValidation = validateInputs(req, currentBasket, []);
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
            error: true,
            errorMsg: Resource.msg('shoppay.error.shipping', 'shoppay', null),
        });
        return next();
    }

    // Find shipping method for selected shipping option
    var applicableShippingMethods = shippingHelpers.getApplicableShippingMethods(shipment);
    var shippingMethod = array.find(applicableShippingMethods, function(shippingMethod) {
        return shippingMethod.ID === data.deliveryMethod.code;
    });

    if(shippingMethod) {
        Transaction.wrap(function () {
            // Set selected shipping method
            shippingHelpers.selectShippingMethod(shipment, shippingMethod.ID);
        });
    }

    COHelpers.recalculateBasket(currentBasket);
    var paymentRequestModel = new PaymentRequestModel(currentBasket);

    if (!shippingMethod) {
        // Shopper selected a shipping method that is not applicable
        res.json({
            error: true,
            errorMsg: Resource.msg('shoppay.error.shipping', 'shoppay', null),
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
 * The ShopPay-SubmitPayment controller finalizes the Shop Pay payment request session with the
 * Shop Pay GraphQL API to complete the modal flow, receives the payment token in response,
 * and creates the SFCC order. The session completion in Shop Pay is asynchronous so the SFCC order
 * will be finalized and placed when the ORDERS_CREATE webhook is received from Shop Pay.
 * @function
 * @memberOf ShopPay
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {category} - sensitive
 * @param {renders} - json
 * @param {serverfunction} - post
 */
server.post('SubmitPayment', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var currentBasket;
    var HookMgr = require('dw/system/HookMgr');
    var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
    var inputs = JSON.parse(req.body);
    var OrderMgr = require('dw/order/OrderMgr');
    var PaymentMgr = require('dw/order/PaymentMgr');
    var validationHelpers = require('*/cartridge/scripts/helpers/basketValidationHelpers');

    if (inputs.basketId) {
        currentBasket = BasketMgr.getTemporaryBasket(inputs.basketId);
    } else {
        currentBasket = BasketMgr.getCurrentBasket();
    }

    var inputValidation = validateInputs(req, currentBasket, ['paymentRequest','token']);
    if (!inputValidation || inputValidation.error) {
        res.json({
            error: true,
            errorMsg: inputValidation.errorMsg
        });
        return next();
    }

    var paymentRequest = inputs['paymentRequest'];
    var token = inputs['token'];

    shoppayCheckoutHelpers.ensureNoEmptyShipments(currentBasket, req);
    COHelpers.recalculateBasket(currentBasket);

    var regeneratedPaymentRequest = new PaymentRequestModel(currentBasket);
    var validPaymentRequest = shoppayCheckoutHelpers.validatePaymentRequest(paymentRequest, regeneratedPaymentRequest);
    if (!validPaymentRequest) {
        res.json({
            error: true,
            errorMsg: Resource.msg('shoppay.input.error.mismatch', 'shoppay', null),
            paymentRequest: regeneratedPaymentRequest
        });
        return next();
    }

    var validShipments = shoppayCheckoutHelpers.validateShippingMethods(currentBasket);
    if (!validShipments) {
        res.json({
            error: true,
            errorMsg: Resource.msg('shoppay.error.shipping', 'shoppay', null)
        });
        return next();
    }

    var validationOrderStatus = hooksHelper('app.validate.order', 'validateOrder', currentBasket, require('*/cartridge/scripts/hooks/validateOrder').validateOrder);
    if (validationOrderStatus.error) {
        res.json({
            error: true,
            errorMsg: validationOrderStatus.message
        });
        return next();
    }

    shoppayCheckoutHelpers.handleBillingAddress(currentBasket, paymentRequest, req);

    var paymentMethodId = shoppayGlobalRefs.shoppayPaymentMethodId;
    var paymentProcessor = PaymentMgr.getPaymentMethod(paymentMethodId).paymentProcessor;
    if (HookMgr.hasHook('app.payment.processor.' + paymentProcessor.ID.toLowerCase())) {
        var handleResult = HookMgr.callHook('app.payment.processor.' + paymentProcessor.ID.toLowerCase(),
            'Handle',
            currentBasket
        );
        if (handleResult.error) {
            res.json({
                error: true,
                errorMsg: handleResult.serverErrors.length > 0 ? handleResult.serverErrors[0] : handleResult.fieldErrors[0]
            });
            return next();
        }
    }

    if (req.session.privacyCache.get('fraudDetectionStatus')) {
        res.json({
            error: true,
            errorMsg: Resource.msg('error.technical', 'checkout', null)
        });
        return next();
    }

    // Creates a new order
    var order = COHelpers.createOrder(currentBasket);
    if (!order) {
        res.json({
            error: true,
            errorMsg: Resource.msg('error.technical', 'checkout', null)
        });
        return next();
    }

    var shoppayPaymentInstruments = order.getPaymentInstruments(paymentMethodId);
    if (order.paymentInstruments.length === 0
        || order.paymentInstruments.length > 1
        || shoppayPaymentInstruments.length != 1
    ) {
        shoppayCheckoutHelpers.failOrder(order);
        res.json({
            error: true,
            errorMsg: Resource.msg('error.technical', 'checkout', null)
        });
        return next();
    }

    var paymentInstrument = shoppayPaymentInstruments[0];
    if (HookMgr.hasHook('app.payment.processor.' + paymentProcessor.ID.toLowerCase())) {
        var authorizationResult = HookMgr.callHook(
            'app.payment.processor.' + paymentProcessor.ID.toLowerCase(),
            'Authorize',
            paymentRequest,
            token,
            paymentInstrument
        );
        if (authorizationResult.error) {
            shoppayCheckoutHelpers.failOrder(order);
            res.json({
                error: true,
                errorMsg: Resource.msg('error.technical', 'checkout', null)
            });
            return next();
        }
    }

    // Handle custom processing post authorization
    var options = {
        req: req,
        res: res
    };
    var postAuthCustomizations = hooksHelper('app.post.auth', 'postAuthorization', authorizationResult, order, options, require('*/cartridge/scripts/hooks/postAuthorizationHandling').postAuthorization);
    if (postAuthCustomizations && Object.prototype.hasOwnProperty.call(postAuthCustomizations, 'error')) {
        res.json(postAuthCustomizations);
        return next();
    }

    var fraudDetectionStatus = hooksHelper('app.fraud.detection', 'fraudDetection', currentBasket, require('*/cartridge/scripts/hooks/fraudDetection').fraudDetection);
    if (fraudDetectionStatus.status === 'fail') {
        shoppayCheckoutHelpers.failOrder(order);

        // Fraud detection failed
        req.session.privacyCache.set('fraudDetectionStatus', true);
        res.json({
            error: true,
            errorMsg: Resource.msg('error.technical', 'checkout', null)
        });
        return next();
    }

    Transaction.wrap(function() {
        order.custom.shoppayOrder = true;
    });

    res.json({
        error: false,
        errorMsg: null,
        orderID: order.orderNo,
        orderToken: order.orderToken,
        continueUrl: URLUtils.url('Order-Confirm').toString()
    })
    next();
});

module.exports = server.exports();
