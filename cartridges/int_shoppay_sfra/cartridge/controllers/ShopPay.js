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
