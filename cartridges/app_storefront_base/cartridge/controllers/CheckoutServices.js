'use strict';

/**
 * @namespace CheckoutServices
 */

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

/**
 * CheckoutServices-Get : This endpoint is only used in multi-ship. The CheckoutServices-Get endpoint is invoked when clicking on"Next: Payment"
 * @name Base/CheckoutServices-Get
 * @function
 * @memberof CheckoutServices
 * @param {middleware} - server.middleware.https
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - get
 */
server.get('Get', server.middleware.https, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var AccountModel = require('*/cartridge/models/account');
    var OrderModel = require('*/cartridge/models/order');
    var Locale = require('dw/util/Locale');
    var Resource = require('dw/web/Resource');
    var URLUtils = require('dw/web/URLUtils');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

    var currentBasket = BasketMgr.getCurrentBasket();
    if (!currentBasket) {
        res.json({
            redirectUrl: URLUtils.url('Cart-Show').toString(),
            error: true
        });

        return next();
    }

    var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
    if (usingMultiShipping === true && currentBasket.shipments.length < 2) {
        req.session.privacyCache.set('usingMultiShipping', false);
        usingMultiShipping = false;
    }

    var currentLocale = Locale.getLocale(req.locale.id);
    var allValid = COHelpers.ensureValidShipments(currentBasket);
    var basketModel = new OrderModel(
        currentBasket,
        { usingMultiShipping: usingMultiShipping, countryCode: currentLocale.country, containerView: 'basket' }
    );

    res.json({
        order: basketModel,
        customer: new AccountModel(req.currentCustomer),
        error: !allValid,
        message: allValid ? '' : Resource.msg('error.message.shipping.addresses', 'checkout', null)
    });

    return next();
});

/**
 * Validates the given form and creates response JSON if there are errors.
 * @param {string} form - the customer form to validate
 * @return {Object} validation result
 */
function validateCustomerForm(form) {
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

    var result = COHelpers.validateCustomerForm(form);

    if (result.formFieldErrors.length) {
        result.customerForm.clear();
        // prepare response JSON with form data and errors
        result.json = {
            form: result.customerForm,
            fieldErrors: result.formFieldErrors,
            serverErrors: [],
            error: true
        };
    }

    return result;
}

/**
 * Handles the route:BeforeComplete for a customer form submission.
 * @param {Object} req - request
 * @param {Object} res - response
 * @param {Object} accountModel - Account model object to include in response
 * @param {string} redirectUrl - redirect URL to send back to client
 */
function handleCustomerRouteBeforeComplete(req, res, accountModel, redirectUrl) {
    var URLUtils = require('dw/web/URLUtils');
    var BasketMgr = require('dw/order/BasketMgr');
    var Locale = require('dw/util/Locale');
    var Transaction = require('dw/system/Transaction');
    var OrderModel = require('*/cartridge/models/order');

    var customerData = res.getViewData();
    var currentBasket = BasketMgr.getCurrentBasket();
    if (!currentBasket) {
        res.json({
            error: true,
            cartError: true,
            fieldErrors: [],
            serverErrors: [],
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });
        return;
    }

    Transaction.wrap(function () {
        currentBasket.setCustomerEmail(customerData.customer.email.value);
    });

    var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
    if (usingMultiShipping === true && currentBasket.shipments.length < 2) {
        req.session.privacyCache.set('usingMultiShipping', false);
        usingMultiShipping = false;
    }

    var currentLocale = Locale.getLocale(req.locale.id);
    var basketModel = new OrderModel(
        currentBasket,
        { usingMultiShipping: usingMultiShipping, countryCode: currentLocale.country, containerView: 'basket' }
    );

    res.json({
        customer: accountModel,
        error: false,
        order: basketModel,
        csrfToken: customerData.csrfToken,
        redirectUrl: redirectUrl
    });
}

/**
 * Handle Ajax guest customer form submit.
 */
server.post(
    'SubmitCustomer',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        // validate guest customer form
        var coCustomerForm = server.forms.getForm('coCustomer');
        var result = validateCustomerForm(coCustomerForm);
        if (result.json) {
            res.json(result.json);
            return next();
        }

        res.setViewData(result.viewData);

        this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
            var AccountModel = require('*/cartridge/models/account');
            var accountModel = new AccountModel(req.currentCustomer);
            handleCustomerRouteBeforeComplete(req, res, accountModel, null);
        });
        return next();
    }
);

/**
 * Handle Ajax registered customer form submit.
 */
server.post(
    'LoginCustomer',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var apiCsrfProtection = require('dw/web/CSRFProtection');
        var Resource = require('dw/web/Resource');
        var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');

        // validate registered customer form
        var coRegisteredCustomerForm = server.forms.getForm('coRegisteredCustomer');
        var result = validateCustomerForm(coRegisteredCustomerForm);
        if (result.json) {
            res.json(result.json);
            return next();
        }

        // login the registered customer
        var viewData = result.viewData;
        var customerForm = result.customerForm;
        var formFieldErrors = result.formFieldErrors;

        viewData.customerLoginResult = accountHelpers.loginCustomer(customerForm.email.value, customerForm.password.value, false);
        if (viewData.customerLoginResult.error) {
            // add customer error message for invalid password
            res.json({
                form: customerForm,
                fieldErrors: formFieldErrors,
                serverErrors: [],
                customerErrorMessage: Resource.msg('error.message.login.wrong', 'checkout', null),
                error: true
            });
            return next();
        }

        // on login the session transforms so we need to retrieve new tokens
        viewData.csrfToken = apiCsrfProtection.generateToken();

        res.setViewData(viewData);

        this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
            var AccountModel = require('*/cartridge/models/account');
            var URLUtils = require('dw/web/URLUtils');

            var accountModel = new AccountModel(viewData.customerLoginResult.authenticatedCustomer);
            var redirectUrl = URLUtils.https('Checkout-Begin', 'stage', 'shipping').abs().toString();
            handleCustomerRouteBeforeComplete(req, res, accountModel, redirectUrl);
        });
        return next();
    }
);


/**
 *  Handle Ajax payment (and billing) form submit
 */
/**
 * CheckoutServices-SubmitPayment : The CheckoutServices-SubmitPayment endpoint will submit the payment information and render the checkout place order page allowing the shopper to confirm and place the order
 * @name Base/CheckoutServices-SubmitPayment
 * @function
 * @memberof CheckoutServices
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {httpparameter} - addressSelector - For Guest shopper: A shipment UUID that contains address that matches the selected address. For returning shopper: ab_<address-name-from-address-book>" of the selected address. For both type of shoppers:  "new" if a brand new address is entered
 * @param {httpparameter} - dwfrm_billing_addressFields_firstName - Input field for the shoppers's first name
 * @param {httpparameter} - dwfrm_billing_addressFields_lastName - Input field for the shoppers's last name
 * @param {httpparameter} - dwfrm_billing_addressFields_address1 - Input field for the shoppers's address 1 - street
 * @param {httpparameter} - dwfrm_billing_addressFields_address2 - Input field for the shoppers's address 2 - street
 * @param {httpparameter} - dwfrm_billing_addressFields_country - Input field for the shoppers's address - country
 * @param {httpparameter} - dwfrm_billing_addressFields_states_stateCode - Input field for the shoppers's address - state code
 * @param {httpparameter} - dwfrm_billing_addressFields_city - Input field for the shoppers's address - city
 * @param {httpparameter} - dwfrm_billing_addressFields_postalCode - Input field for the shoppers's address - postal code
 * @param {httpparameter} - csrf_token - hidden input field CSRF token
 * @param {httpparameter} - localizedNewAddressTitle - label for new address
 * @param {httpparameter} - dwfrm_billing_contactInfoFields_email - Input field for the shopper's email address
 * @param {httpparameter} - dwfrm_billing_contactInfoFields_phone - Input field for the shopper's phone number
 * @param {httpparameter} - dwfrm_billing_paymentMethod - Input field for the shopper's payment method
 * @param {httpparameter} - dwfrm_billing_creditCardFields_cardType - Input field for the shopper's credit card type
 * @param {httpparameter} - dwfrm_billing_creditCardFields_cardNumber - Input field for the shopper's credit card number
 * @param {httpparameter} - dwfrm_billing_creditCardFields_expirationMonth - Input field for the shopper's credit card expiration month
 * @param {httpparameter} - dwfrm_billing_creditCardFields_expirationYear - Input field for the shopper's credit card expiration year
 * @param {httpparameter} - dwfrm_billing_creditCardFields_securityCode - Input field for the shopper's credit card security code
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post(
    'SubmitPayment',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var PaymentManager = require('dw/order/PaymentMgr');
        var HookManager = require('dw/system/HookMgr');
        var Resource = require('dw/web/Resource');
        var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

        var viewData = {};
        var paymentForm = server.forms.getForm('billing');

        // verify billing form data
        var billingFormErrors = COHelpers.validateBillingForm(paymentForm.addressFields);
        var contactInfoFormErrors = COHelpers.validateFields(paymentForm.contactInfoFields);

        var formFieldErrors = [];
        if (Object.keys(billingFormErrors).length) {
            formFieldErrors.push(billingFormErrors);
        } else {
            viewData.address = {
                firstName: { value: paymentForm.addressFields.firstName.value },
                lastName: { value: paymentForm.addressFields.lastName.value },
                address1: { value: paymentForm.addressFields.address1.value },
                address2: { value: paymentForm.addressFields.address2.value },
                city: { value: paymentForm.addressFields.city.value },
                postalCode: { value: paymentForm.addressFields.postalCode.value },
                countryCode: { value: paymentForm.addressFields.country.value }
            };

            if (Object.prototype.hasOwnProperty.call(paymentForm.addressFields, 'states')) {
                viewData.address.stateCode = { value: paymentForm.addressFields.states.stateCode.value };
            }
        }

        if (Object.keys(contactInfoFormErrors).length) {
            formFieldErrors.push(contactInfoFormErrors);
        } else {
            viewData.phone = { value: paymentForm.contactInfoFields.phone.value };
        }

        var paymentMethodIdValue = paymentForm.paymentMethod.value;
        if (!PaymentManager.getPaymentMethod(paymentMethodIdValue).paymentProcessor) {
            throw new Error(Resource.msg(
                'error.payment.processor.missing',
                'checkout',
                null
            ));
        }

        var paymentProcessor = PaymentManager.getPaymentMethod(paymentMethodIdValue).getPaymentProcessor();

        var paymentFormResult;
        if (HookManager.hasHook('app.payment.form.processor.' + paymentProcessor.ID.toLowerCase())) {
            paymentFormResult = HookManager.callHook('app.payment.form.processor.' + paymentProcessor.ID.toLowerCase(),
                'processForm',
                req,
                paymentForm,
                viewData
            );
        } else {
            paymentFormResult = HookManager.callHook('app.payment.form.processor.default_form_processor', 'processForm');
        }

        if (paymentFormResult.error && paymentFormResult.fieldErrors) {
            formFieldErrors.push(paymentFormResult.fieldErrors);
        }

        if (formFieldErrors.length || paymentFormResult.serverErrors) {
            // respond with form data and errors
            res.json({
                form: paymentForm,
                fieldErrors: formFieldErrors,
                serverErrors: paymentFormResult.serverErrors ? paymentFormResult.serverErrors : [],
                error: true
            });
            return next();
        }

        res.setViewData(paymentFormResult.viewData);

        this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
            var BasketMgr = require('dw/order/BasketMgr');
            var HookMgr = require('dw/system/HookMgr');
            var PaymentMgr = require('dw/order/PaymentMgr');
            var Transaction = require('dw/system/Transaction');
            var AccountModel = require('*/cartridge/models/account');
            var OrderModel = require('*/cartridge/models/order');
            var URLUtils = require('dw/web/URLUtils');
            var Locale = require('dw/util/Locale');
            var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
            var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
            var validationHelpers = require('*/cartridge/scripts/helpers/basketValidationHelpers');

            var currentBasket = BasketMgr.getCurrentBasket();

            var billingData = res.getViewData();

            if (!currentBasket) {
                delete billingData.paymentInformation;

                res.json({
                    error: true,
                    cartError: true,
                    fieldErrors: [],
                    serverErrors: [],
                    redirectUrl: URLUtils.url('Cart-Show').toString()
                });
                return;
            }

            var validatedProducts = validationHelpers.validateProducts(currentBasket);
            if (validatedProducts.error) {
                delete billingData.paymentInformation;

                res.json({
                    error: true,
                    cartError: true,
                    fieldErrors: [],
                    serverErrors: [],
                    redirectUrl: URLUtils.url('Cart-Show').toString()
                });
                return;
            }

            var billingAddress = currentBasket.billingAddress;
            var billingForm = server.forms.getForm('billing');
            var paymentMethodID = billingData.paymentMethod.value;
            var result;

            billingForm.creditCardFields.cardNumber.htmlValue = '';
            billingForm.creditCardFields.securityCode.htmlValue = '';

            Transaction.wrap(function () {
                if (!billingAddress) {
                    billingAddress = currentBasket.createBillingAddress();
                }

                billingAddress.setFirstName(billingData.address.firstName.value);
                billingAddress.setLastName(billingData.address.lastName.value);
                billingAddress.setAddress1(billingData.address.address1.value);
                billingAddress.setAddress2(billingData.address.address2.value);
                billingAddress.setCity(billingData.address.city.value);
                billingAddress.setPostalCode(billingData.address.postalCode.value);
                if (Object.prototype.hasOwnProperty.call(billingData.address, 'stateCode')) {
                    billingAddress.setStateCode(billingData.address.stateCode.value);
                }
                billingAddress.setCountryCode(billingData.address.countryCode.value);
                billingAddress.setPhone(billingData.phone.value);
            });


            // if there is no selected payment option and balance is greater than zero
            if (!paymentMethodID && currentBasket.totalGrossPrice.value > 0) {
                var noPaymentMethod = {};

                noPaymentMethod[billingData.paymentMethod.htmlName] =
                    Resource.msg('error.no.selected.payment.method', 'payment', null);

                delete billingData.paymentInformation;

                res.json({
                    form: billingForm,
                    fieldErrors: [noPaymentMethod],
                    serverErrors: [],
                    error: true
                });
                return;
            }

            var processor = PaymentMgr.getPaymentMethod(paymentMethodID).getPaymentProcessor();

            // check to make sure there is a payment processor
            if (!processor) {
                throw new Error(Resource.msg(
                    'error.payment.processor.missing',
                    'checkout',
                    null
                ));
            }

            if (HookMgr.hasHook('app.payment.processor.' + processor.ID.toLowerCase())) {
                result = HookMgr.callHook('app.payment.processor.' + processor.ID.toLowerCase(),
                    'Handle',
                    currentBasket,
                    billingData.paymentInformation,
                    paymentMethodID,
                    req
                );
            } else {
                result = HookMgr.callHook('app.payment.processor.default', 'Handle');
            }

            // need to invalidate credit card fields
            if (result.error) {
                delete billingData.paymentInformation;

                res.json({
                    form: billingForm,
                    fieldErrors: result.fieldErrors,
                    serverErrors: result.serverErrors,
                    error: true
                });
                return;
            }

            if (HookMgr.hasHook('app.payment.form.processor.' + processor.ID.toLowerCase())) {
                HookMgr.callHook('app.payment.form.processor.' + processor.ID.toLowerCase(),
                    'savePaymentInformation',
                    req,
                    currentBasket,
                    billingData
                );
            } else {
                HookMgr.callHook('app.payment.form.processor.default', 'savePaymentInformation');
            }

            // Calculate the basket
            Transaction.wrap(function () {
                basketCalculationHelpers.calculateTotals(currentBasket);
            });

            // Re-calculate the payments.
            var calculatedPaymentTransaction = COHelpers.calculatePaymentTransaction(
                currentBasket
            );

            if (calculatedPaymentTransaction.error) {
                res.json({
                    form: paymentForm,
                    fieldErrors: [],
                    serverErrors: [Resource.msg('error.technical', 'checkout', null)],
                    error: true
                });
                return;
            }

            var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
            if (usingMultiShipping === true && currentBasket.shipments.length < 2) {
                req.session.privacyCache.set('usingMultiShipping', false);
                usingMultiShipping = false;
            }

            hooksHelper('app.customer.subscription', 'subscribeTo', [paymentForm.subscribe.checked, currentBasket.customerEmail], function () {});

            var currentLocale = Locale.getLocale(req.locale.id);

            var basketModel = new OrderModel(
                currentBasket,
                { usingMultiShipping: usingMultiShipping, countryCode: currentLocale.country, containerView: 'basket' }
            );

            var accountModel = new AccountModel(req.currentCustomer);
            var renderedStoredPaymentInstrument = COHelpers.getRenderedPaymentInstruments(
                req,
                accountModel
            );

            delete billingData.paymentInformation;

            res.json({
                renderedPaymentInstruments: renderedStoredPaymentInstrument,
                customer: accountModel,
                order: basketModel,
                form: billingForm,
                error: false
            });
        });

        return next();
    }
);

/**
 * CheckoutServices-PlaceOrder : The CheckoutServices-PlaceOrder endpoint places the order
 * @name Base/CheckoutServices-PlaceOrder
 * @function
 * @memberof CheckoutServices
 * @param {middleware} - server.middleware.https
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post('PlaceOrder', server.middleware.https, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var OrderMgr = require('dw/order/OrderMgr');
    var Resource = require('dw/web/Resource');
    var Transaction = require('dw/system/Transaction');
    var URLUtils = require('dw/web/URLUtils');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var validationHelpers = require('*/cartridge/scripts/helpers/basketValidationHelpers');
    var addressHelpers = require('*/cartridge/scripts/helpers/addressHelpers');

    var currentBasket = BasketMgr.getCurrentBasket();

    if (!currentBasket) {
        res.json({
            error: true,
            cartError: true,
            fieldErrors: [],
            serverErrors: [],
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });
        return next();
    }

    var validatedProducts = validationHelpers.validateProducts(currentBasket);
    if (validatedProducts.error) {
        res.json({
            error: true,
            cartError: true,
            fieldErrors: [],
            serverErrors: [],
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });
        return next();
    }

    if (req.session.privacyCache.get('fraudDetectionStatus')) {
        res.json({
            error: true,
            cartError: true,
            redirectUrl: URLUtils.url('Error-ErrorCode', 'err', '01').toString(),
            errorMessage: Resource.msg('error.technical', 'checkout', null)
        });

        return next();
    }

    var validationOrderStatus = hooksHelper('app.validate.order', 'validateOrder', currentBasket, require('*/cartridge/scripts/hooks/validateOrder').validateOrder);
    if (validationOrderStatus.error) {
        res.json({
            error: true,
            errorMessage: validationOrderStatus.message
        });
        return next();
    }

    // Check to make sure there is a shipping address
    if (currentBasket.defaultShipment.shippingAddress === null) {
        res.json({
            error: true,
            errorStage: {
                stage: 'shipping',
                step: 'address'
            },
            errorMessage: Resource.msg('error.no.shipping.address', 'checkout', null)
        });
        return next();
    }

    // Check to make sure billing address exists
    if (!currentBasket.billingAddress) {
        res.json({
            error: true,
            errorStage: {
                stage: 'payment',
                step: 'billingAddress'
            },
            errorMessage: Resource.msg('error.no.billing.address', 'checkout', null)
        });
        return next();
    }

    // Calculate the basket
    Transaction.wrap(function () {
        basketCalculationHelpers.calculateTotals(currentBasket);
    });

    // Re-validates existing payment instruments
    var validPayment = COHelpers.validatePayment(req, currentBasket);
    if (validPayment.error) {
        res.json({
            error: true,
            errorStage: {
                stage: 'payment',
                step: 'paymentInstrument'
            },
            errorMessage: Resource.msg('error.payment.not.valid', 'checkout', null)
        });
        return next();
    }

    // Re-calculate the payments.
    var calculatedPaymentTransactionTotal = COHelpers.calculatePaymentTransaction(currentBasket);
    if (calculatedPaymentTransactionTotal.error) {
        res.json({
            error: true,
            errorMessage: Resource.msg('error.technical', 'checkout', null)
        });
        return next();
    }

    // Creates a new order.
    var order = COHelpers.createOrder(currentBasket);
    if (!order) {
        res.json({
            error: true,
            errorMessage: Resource.msg('error.technical', 'checkout', null)
        });
        return next();
    }

    // Handles payment authorization
    var handlePaymentResult = COHelpers.handlePayments(order, order.orderNo);

    // Handle custom processing post authorization
    var options = {
        req: req,
        res: res
    };
    var postAuthCustomizations = hooksHelper('app.post.auth', 'postAuthorization', handlePaymentResult, order, options, require('*/cartridge/scripts/hooks/postAuthorizationHandling').postAuthorization);
    if (postAuthCustomizations && Object.prototype.hasOwnProperty.call(postAuthCustomizations, 'error')) {
        res.json(postAuthCustomizations);
        return next();
    }

    if (handlePaymentResult.error) {
        res.json({
            error: true,
            errorMessage: Resource.msg('error.technical', 'checkout', null)
        });
        return next();
    }

    var fraudDetectionStatus = hooksHelper('app.fraud.detection', 'fraudDetection', currentBasket, require('*/cartridge/scripts/hooks/fraudDetection').fraudDetection);
    if (fraudDetectionStatus.status === 'fail') {
        Transaction.wrap(function () { OrderMgr.failOrder(order, true); });

        // fraud detection failed
        req.session.privacyCache.set('fraudDetectionStatus', true);

        res.json({
            error: true,
            cartError: true,
            redirectUrl: URLUtils.url('Error-ErrorCode', 'err', fraudDetectionStatus.errorCode).toString(),
            errorMessage: Resource.msg('error.technical', 'checkout', null)
        });

        return next();
    }

    // Places the order
    var placeOrderResult = COHelpers.placeOrder(order, fraudDetectionStatus);
    if (placeOrderResult.error) {
        res.json({
            error: true,
            errorMessage: Resource.msg('error.technical', 'checkout', null)
        });
        return next();
    }

    if (req.currentCustomer.addressBook) {
        // save all used shipping addresses to address book of the logged in customer
        var allAddresses = addressHelpers.gatherShippingAddresses(order);
        allAddresses.forEach(function (address) {
            if (!addressHelpers.checkIfAddressStored(address, req.currentCustomer.addressBook.addresses)) {
                addressHelpers.saveAddress(address, req.currentCustomer, addressHelpers.generateAddressName(address));
            }
        });
    }

    if (order.getCustomerEmail()) {
        COHelpers.sendConfirmationEmail(order, req.locale.id);
    }

    // Reset usingMultiShip after successful Order placement
    req.session.privacyCache.set('usingMultiShipping', false);

    // TODO: Exposing a direct route to an Order, without at least encoding the orderID
    //  is a serious PII violation.  It enables looking up every customers orders, one at a
    //  time.
    res.json({
        error: false,
        orderID: order.orderNo,
        orderToken: order.orderToken,
        continueUrl: URLUtils.url('Order-Confirm').toString()
    });

    return next();
});

module.exports = server.exports();
