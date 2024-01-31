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
    var currentBasket;
    var paymentRequestModel;
    var httpParameterMap = req.httpParameterMap;
    if (req.httpParameterMap.basketId) {
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

server.post('BuyNowData', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var data = JSON.parse(req.body);
    var shoppayCheckoutHelpers = require('*/cartridge/scripts/shoppay/helpers/shoppayCheckoutHelpers');

    var buyNowPaymentRequest;
    if (data.pidsObj) {
        collections.forEach(data.pidsObj, function(pidObj) {
            // Kristin TODO: Product set add to cart
        });
    } else if (data.childPids) {
        // Kristin TODO: Bundle add to cart
    } else {
        buyNowPaymentRequest = shoppayCheckoutHelpers.getBuyNowData(data.pid, data.quantity, data.options);
    }

    res.json({
        error: false,
        errorMsg: null,
        paymentRequest: buyNowPaymentRequest
    })
    next();
});

server.post('PrepareBasket', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var ProductMgr = require('dw/catalog/ProductMgr');
    var ShippingMgr = require('dw/order/ShippingMgr');
    var Transaction = require('dw/system/Transaction');

    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var shoppayCheckoutHelpers = require('*/cartridge/scripts/shoppay/helpers/shoppayCheckoutHelpers');
    var PaymentRequestModel = require('*/cartridge/models/paymentRequest');
    var paymentRequestModel;
    var currentBasket;

    var data = JSON.parse(req.body);

    if (!data.pid) {
        // Missing product SKU
        res.json({
            error: true,
            errorMsg: 'sku missing'
        });
        return next();
    }

    // Get product to add to the basket
    var product = ProductMgr.getProduct(data.pid);

    if (!product) {
        // Product doesn't exist
        res.json({
            error: true,
            errorMsg: 'invalid product'
        });
        return next();
    }

    // Get product option model
    var optionModel = product.getOptionModel();
    if (data.options) {
        data.options.forEach(function (option) {
            var productOption = optionModel.getOption(option.id);
            if (productOption) {
                var productOptionValue = optionModel.getOptionValue(productOption, option.valueId);
                if (productOptionValue) {
                    // Update selected value for product option
                    optionModel.setSelectedOptionValue(productOption, productOptionValue);
                }
            }
        });
    }

    Transaction.wrap(function () {
        // Create a temporary basket for Buy Now
        currentBasket = shoppayCheckoutHelpers.createBuyNowBasket();
        var shipment = currentBasket.defaultShipment;

        // Clear any existing line items out of the basket
        currentBasket.productLineItems.toArray().forEach(function (pli) {
            currentBasket.removeProductLineItem(pli);
        });

        // Create a product line item for the product, option model, and quantity
        var pli = currentBasket.createProductLineItem(product, optionModel, shipment);
        pli.setQuantityValue(data.quantity || 1);

        // Calculate basket
        cartHelper.ensureAllShipmentsHaveMethods(currentBasket);
        basketCalculationHelpers.calculateTotals(currentBasket);
    });

    try {
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
        basketId: currentBasket.UUID,
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
    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket;
    var inputs = JSON.parse(req.body);

    if (inputs.basketId) {
        currentBasket = BasketMgr.getTemporaryBasket(inputs.basketId);
    }
    else {
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

server.post('ShippingAddressChanged', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var Transaction = require('dw/system/Transaction');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var PaymentRequestModel = require('*/cartridge/models/paymentRequest');
    var currentBasket;
    var inputs = JSON.parse(req.body);

    if (inputs.basketId) {
        currentBasket = BasketMgr.getTemporaryBasket(inputs.basketId);
    }
    else {
        currentBasket = BasketMgr.getCurrentBasket();
    }

    var inputValidation = validateInputs(req, currentBasket, ['selectedAddress']);
    if (!inputValidation || inputValidation.error) {
        res.json({
            error: true,
            errorMsg: inputValidation.errorMsg
        });
        return next();
    }
    var inputAddress = inputs.selectedAddress;
    Transaction.wrap(function () {
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
    });

    var paymentRequest = new PaymentRequestModel(currentBasket);

    res.json({
        error: false,
        errorMsg: null,
        paymentRequest: paymentRequest
    });
    next();
});

server.post('DeliveryMethodChanged', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var ShippingMgr = require('dw/order/ShippingMgr');
    var Transaction = require('dw/system/Transaction');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var collections = require('*/cartridge/scripts/util/collections');
    var PaymentRequestModel = require('*/cartridge/models/paymentRequest');
    var currentBasket;
    var inputs = JSON.parse(req.body);

    if (inputs.basketId) {
        currentBasket = BasketMgr.getTemporaryBasket(inputs.basketId);
    }
    else {
        currentBasket = BasketMgr.getCurrentBasket();
    }

    var inputValidation = validateInputs(req, currentBasket, ['selectedDeliveryMethod']);
    if (!inputValidation || inputValidation.error) {
        res.json({
            error: true,
            errorMsg: inputValidation.errorMsg
        });
        return next();
    }
    var deliveryMethodInput = inputs.selectedDeliveryMethod;
    var shippingMethods = ShippingMgr.getAllShippingMethods();
    var newShippingMethod = collections.find(shippingMethods, function (shippingMethod) {
        return shippingMethod.ID === deliveryMethodInput.code;
    });
    Transaction.wrap(function() {
        currentBasket.defaultShipment.setShippingMethod(newShippingMethod);
        basketCalculationHelpers.calculateTotals(currentBasket);
    });

    var paymentRequest = new PaymentRequestModel(currentBasket);
    res.json({
        error: false,
        errorMsg: null,
        paymentRequest: paymentRequest
    });
    next();
});

server.post('SubmitPayment', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var BasketMgr = require('dw/order/BasketMgr');
    var HookMgr = require('dw/system/HookMgr');
    var OrderMgr = require('dw/order/OrderMgr');
    var PaymentMgr = require('dw/order/PaymentMgr');
    var currentBasket = BasketMgr.getCurrentBasket();
    var inputs = JSON.parse(req.body);

    if (inputs.basketId) {
        currentBasket = BasketMgr.getTemporaryBasket(inputs.basketId);
    }
    else {
        currentBasket = BasketMgr.getCurrentBasket();
    }

    var inputValidation = validateInputs(req, currentBasket, ['paymentRequest', 'token']);
    if (!inputValidation || inputValidation.error) {
        res.json({
            error: true,
            errorMsg: inputValidation.errorMsg
        });
        return next();
    }

    var paymentRequest = inputs.paymentRequest;
    /* shippingAddress.id is not a valid input for the GraphQL request, but is included in the payment request object
       from client-side */
    if (paymentRequest.shippingAddress.id) {
        delete paymentRequest.shippingAddress.id;
    }
    var token = inputs.token;
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
    if (HookMgr.hasHook('app.payment.processor.' + paymentProcessor.ID.toLowerCase())) {
        var handleResult = HookMgr.callHook(
            'app.payment.processor.' + paymentProcessor.ID.toLowerCase(),
            'Handle',
            currentBasket
        );
    }

    var order = OrderMgr.createOrder(currentBasket);
    var paymentInstrument = order.paymentInstruments[0];
    var authorizationResult;
    if (HookMgr.hasHook('app.payment.processor.' + paymentProcessor.ID.toLowerCase())) {
        authorizationResult = HookMgr.callHook(
            'app.payment.processor.' + paymentProcessor.ID.toLowerCase(),
            'Authorize',
            paymentRequest,
            token,
            paymentInstrument
        );
    };

    if (authorizationResult.error) {
        res.json({
            error: true,
            errorMsg: authorizationResult.serverErrors.length > 0 ? authorizationResult.serverErrors[0] : authorizationResults.fieldErrors[0]
        });
        return next();
    }

    res.json({
        error: false,
        errorMsg: null,
        orderID: order.orderNo,
        orderToken: order.orderToken,
        continueUrl: URLUtils.url('Order-Confirm').toString()
    });
    next();
});

module.exports = server.exports();
