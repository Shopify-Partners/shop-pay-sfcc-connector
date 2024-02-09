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
var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
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

    // var currentBasket = BasketMgr.getCurrentBasket();  // COMMENTING OUT (SETTING VALUE BELOW IN CONDITIONAL -- DOUBLE CHECK ????)
// =========================== FROM SSPSC-38 POC ===========================
    var currentBasket;
    var paymentRequestModel;
    var httpParameterMap = req.httpParameterMap;
    var test = req.httpParameterMap.basketId;
    if (req.httpParameterMap.basketId && req.httpParameterMap.basketId.value) {
        currentBasket = BasketMgr.getTemporaryBasket(req.httpParameterMap.basketId.value);
    }
    else {
        currentBasket = BasketMgr.getCurrentBasket();
    }
    // =====================================================================


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
        // var paymentRequestModel = new PaymentRequestModel(currentBasket); // COMMENTING OUT (PREVIOUS HANDLING ON DEVEVLOP BRANCH VS. POC HANDLING ON FOLLOWING LINE ????)
        paymentRequestModel = new PaymentRequestModel(currentBasket);
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


// =========================== NEW CONTROLLERS FROM SSPSC-38 POC ===========================

/**
 * The ShopPay-BuyNowData controller
 * listener event.
 * @name Base/ShopPay-BuyNowData
 * @function
 * @memberOf ShopPay
 */
server.post('BuyNowData', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var product = JSON.parse(req.body);
    var shoppayCheckoutHelpers = require('*/cartridge/scripts/shoppay/helpers/shoppayCheckoutHelpers');

    var buyNowPaymentRequest = shoppayCheckoutHelpers.getBuyNowData(product);

    res.json({
        error: false,
        errorMsg: null,
        paymentRequest: buyNowPaymentRequest
    })
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
    var BasketMgr = require('dw/order/BasketMgr');
    var ProductMgr = require('dw/catalog/ProductMgr');
    var ShippingMgr = require('dw/order/ShippingMgr');
    var Transaction = require('dw/system/Transaction');

    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var shoppayCheckoutHelpers = require('*/cartridge/scripts/shoppay/helpers/shoppayCheckoutHelpers');
    var PaymentRequestModel = require('*/cartridge/models/paymentRequest');
    var shippingHelpers = require('*/cartridge/scripts/checkout/shippingHelpers');
    var paymentRequestModel;
    var currentBasket;

    var product = JSON.parse(req.body);

    var basket = Transaction.wrap(shoppayCheckoutHelpers.createBuyNowBasket);
    var shippingMethod = ShippingMgr.defaultShippingMethod;

    // Kristin TODO: Consider using OOTB cartHelper.js: addProductToCart for final version
    var result;
    var paymentRequestModel;
    if (product.pidsObj && product.pidsObj.length > 0) {
        pidsObj.forEach(function (PIDObj) {
            var PIDObjResult = shoppayCheckoutHelpers.addProductToTempBasket(product, basket);
            if (PIDObjResult.error) {
                result.error = PIDObjResult.error;
                result.errorMsg = PIDObjResult.message;
            }
        });
    } else {
        result = shoppayCheckoutHelpers.addProductToTempBasket(product, basket);
    }

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
            var test = basket;
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
        logger.error('[ShopPay-GetCartSummary] error: \n\r' + e.message + '\n\r' + e.stack);
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

// =====================================================================================


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
    // var currentBasket = BasketMgr.getCurrentBasket(); // COMMENTING OUT (DECLARING BELOW IN CONDITIONAL -- DOUBLE CHECK ????)
    
    // =========================== FROM SSPSC-38 POC BRANCH ===========================
    var currentBasket;
    var inputs = JSON.parse(req.body);

    if (inputs.basketId) {
        currentBasket = BasketMgr.getTemporaryBasket(inputs.basketId);
    } else {
        currentBasket = BasketMgr.getCurrentBasket();
    }
    // ================================================================================


    var inputValidation = validateInputs(req, currentBasket, ['paymentRequest']);
    if (!inputValidation || inputValidation.error) {
        res.json({
            error: true,
            errorMsg: inputValidation.errorMsg
        });
        return next();
    }

    var inputs = JSON.parse(req.body);
    var paymentRequest = inputs.paymentRequest;

    var storefrontAPI = require('*/cartridge/scripts/shoppay/storefrontAPI');
    var response = storefrontAPI.shopPayPaymentRequestSessionCreate(currentBasket, paymentRequest);
    if (!response
        || response.error
        || !response.shopPayPaymentRequestSessionCreate
        || response.shopPayPaymentRequestSessionCreate.userErrors.length > 0
        || response.shopPayPaymentRequestSessionCreate.shopPayPaymentRequestSession == null
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
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var PaymentRequestModel = require('*/cartridge/models/paymentRequest');
    // var currentBasket = BasketMgr.getCurrentBasket(); // COMMENTING OUT (DECLARING BELOW IN CONDITIONAL -- DOUBLE CHECK ????)

    // =========================== FROM SSPSC-38 POC ===========================
    var currentBasket;
    var inputs = JSON.parse(req.body);

    if (inputs.basketId) {
        currentBasket = BasketMgr.getTemporaryBasket(inputs.basketId);
    }
    else {
        currentBasket = BasketMgr.getCurrentBasket();
    }
    // ==========================================================================


    var data = JSON.parse(req.body);

    // var inputValidation = validateInputs(req, currentBasket, ['selectedAddress']); // FROM POC BRANCH (STILL NEEDED???)
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

    var inputAddress = inputs.selectedAddress;
    Transaction.wrap(function () {

        // =========================== FROM SSPSC-38 POC ===========================
        var shipment = currentBasket.defaultShipment;
        if (!shipment.shippingAddress) {
            shipment.createShippingAddress();
        }

        var address = shipment.shippingAddress;
        address.firstName = inputAddress.firstName;
        address.lastName = inputAddress.lastName;
        address.address1 = inputAddress.address1;
        address.city = inputAddress.city;
        address.stateCode = inputAddress.provinceCode;
        address.postalCode = inputAddress.postalCode;
        address.countryCode = inputAddress.postalCode;
        address.phone = inputAddress.phone;
        address.companyName = inputAddress.companyName;

        currentBasket.customerEmail = inputAddress.email;
        basketCalculationHelpers.calculateTotals(currentBasket);
    // ==========================================================================


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

    // =========================== FROM POC BRANCH ===========================
    var ShippingMgr = require('dw/order/ShippingMgr');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var collections = require('*/cartridge/scripts/util/collections');
    // =======================================================================

    var SalesforcePaymentRequest = require('dw/extensions/payments/SalesforcePaymentRequest');
    var Transaction = require('dw/system/Transaction');
    var PaymentRequestModel = require('*/cartridge/models/paymentRequest');
    // var currentBasket = BasketMgr.getCurrentBasket();  // COMMENTING OUT (DECLARING BELOW IN CONDITIONAL -- DOUBLE CHECK ????)
    var currentBasket;

    var array = require('*/cartridge/scripts/util/array');
    var shippingHelpers = require('*/cartridge/scripts/checkout/shippingHelpers');

    var data = JSON.parse(req.body);


    // =========================== FROM SSPSC-38 POC ===========================
    if (data.basketId) {
        currentBasket = BasketMgr.getTemporaryBasket(data.basketId);
    }
    else {
        currentBasket = BasketMgr.getCurrentBasket();
    }

    // var inputValidation = validateInputs(req, currentBasket, ['selectedDeliveryMethod']);
    // ==========================================================================

    var inputValidation = validateInputs(req, currentBasket, ['deliveryMethod']);
    if (!inputValidation || inputValidation.error) {
        res.json({
            error: true,
            errorMsg: inputValidation.errorMsg
        });
        return next();
    }


    // =========================== FROM SSPSC-38 POC ===========================
    var deliveryMethodInput = data.selectedDeliveryMethod;
    var shippingMethods = ShippingMgr.getAllShippingMethods();
    var newShippingMethod = collections.find(shippingMethods, function (shippingMethod) {
        return shippingMethod.ID === deliveryMethodInput.code;
    });
    Transaction.wrap(function() {
        currentBasket.defaultShipment.setShippingMethod(newShippingMethod);
        basketCalculationHelpers.calculateTotals(currentBasket);
    });
    // ==========================================================================


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

    if (!shippingMethod) {
        // Shopper selected a shipping method that is not applicable
        res.json({
            error: true,
            errorMsg: Resource.msg('shoppay.error.shipping', 'shoppay', null),
        });
        return next();
    }

    Transaction.wrap(function () {
        // Set selected shipping method
        shippingHelpers.selectShippingMethod(shipment, shippingMethod.ID);
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
    var URLUtils = require('dw/web/URLUtils');
    var BasketMgr = require('dw/order/BasketMgr');
    var HookMgr = require('dw/system/HookMgr');
    var OrderMgr = require('dw/order/OrderMgr');
    var PaymentMgr = require('dw/order/PaymentMgr');
    var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
    var PaymentRequestModel = require('*/cartridge/models/paymentRequest');
    var shoppayCheckoutHelpers = require('*/cartridge/scripts/shoppay/helpers/shoppayCheckoutHelpers');
    var validationHelpers = require('*/cartridge/scripts/helpers/basketValidationHelpers');

    var currentBasket = BasketMgr.getCurrentBasket();

    // =========================== FROM SSPSC-38 POC ===========================
    var inputs = JSON.parse(req.body);
    if (inputs.basketId) {
        currentBasket = BasketMgr.getTemporaryBasket(inputs.basketId);
    }
    else {
        currentBasket = BasketMgr.getCurrentBasket();
    }
    // ==========================================================================

    var inputValidation = validateInputs(req, currentBasket, ['paymentRequest','token']);
    if (!inputValidation || inputValidation.error) {
        res.json({
            error: true,
            errorMsg: inputValidation.errorMsg
        });
        return next();
    }

    // var inputs = JSON.parse(req.body);
    var paymentRequest = inputs['paymentRequest'];

    // =========================== FROM SSPSC-38 POC ===========================
    /* shippingAddress.id is not a valid input for the GraphQL request, but is included in the payment request object from client-side */
    if (paymentRequest.shippingAddress.id) {
        delete paymentRequest.shippingAddress.id;
    }
    // ==========================================================================

    var token = inputs['token'];


    // =========================== FROM SSPSC-38 POC ===========================
    Transaction.wrap(function() {
        if (!currentBasket.billingAddress) {
            currentBasket.createBillingAddress();
        }
        currentBasket.customerEmail = paymentRequest.shippingAddress.email;
        /* Customer name is required for order creation. Billing address is unavailable in paymentRequest
            object during checkout, so placeholder from shipping address is used for unregistered customers
            until ORDERS_CREATE webhook is received with billing information. */
        if (req.currentCustomer.profile) {
            currentBasket.billingAddress.firstName = req.currentCustomer.profile.firstName;
            currentBasket.billingAddress.lastName = req.currentCustomer.profile.lastName;
        } else {
            currentBasket.billingAddress.firstName = paymentRequest.shippingAddress.firstName;
            currentBasket.billingAddress.lastName = paymentRequest.shippingAddress.lastName;
        }
    });

    var paymentMethodID = shoppayGlobalRefs.shoppayPaymentMethodId;
    var paymentProcessor = PaymentMgr.getPaymentMethod(paymentMethodID).paymentProcessor;
    // ==========================================================================

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

    // Creates a new order.
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

        // fraud detection failed
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
