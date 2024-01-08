'use strict';

/**
 * @namespace PaymentInstruments
 */

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

/**
 * Checks if a credit card is valid or not
 * @param {Object} req - request object
 * @param {Object} card - plain object with card details
 * @param {Object} form - form object
 * @returns {boolean} a boolean representing card validation
 */
function verifyCard(req, card, form) {
    var collections = require('*/cartridge/scripts/util/collections');
    var Resource = require('dw/web/Resource');
    var PaymentMgr = require('dw/order/PaymentMgr');
    var PaymentStatusCodes = require('dw/order/PaymentStatusCodes');
    var PaymentInstrument = require('dw/order/PaymentInstrument');

    var currentCustomer = req.currentCustomer.raw;
    var countryCode = req.geolocation.countryCode;
    var creditCardPaymentMethod = PaymentMgr.getPaymentMethod(PaymentInstrument.METHOD_CREDIT_CARD);
    var paymentCard = PaymentMgr.getPaymentCard(card.cardType);
    var error = false;

    var applicablePaymentCards = creditCardPaymentMethod.getApplicablePaymentCards(
        currentCustomer,
        countryCode,
        null
    );

    var cardNumber = card.cardNumber;
    var creditCardStatus;
    var formCardNumber = form.cardNumber;

    if (paymentCard) {
        if (applicablePaymentCards.contains(paymentCard)) {
            creditCardStatus = paymentCard.verify(
                card.expirationMonth,
                card.expirationYear,
                cardNumber
            );
        } else {
            // Invalid Payment Instrument
            formCardNumber.valid = false;
            formCardNumber.error = Resource.msg('error.payment.not.valid', 'checkout', null);
            error = true;
        }
    } else {
        formCardNumber.valid = false;
        formCardNumber.error = Resource.msg('error.message.creditnumber.invalid', 'forms', null);
        error = true;
    }

    if (creditCardStatus && creditCardStatus.error) {
        collections.forEach(creditCardStatus.items, function (item) {
            switch (item.code) {
                case PaymentStatusCodes.CREDITCARD_INVALID_CARD_NUMBER:
                    formCardNumber.valid = false;
                    formCardNumber.error =
                        Resource.msg('error.message.creditnumber.invalid', 'forms', null);
                    error = true;
                    break;

                case PaymentStatusCodes.CREDITCARD_INVALID_EXPIRATION_DATE:
                    var expirationMonth = form.expirationMonth;
                    var expirationYear = form.expirationYear;
                    expirationMonth.valid = false;
                    expirationMonth.error =
                        Resource.msg('error.message.creditexpiration.expired', 'forms', null);
                    expirationYear.valid = false;
                    error = true;
                    break;
                default:
                    error = true;
            }
        });
    }
    return error;
}

/**
 * Creates an object from form values
 * @param {Object} paymentForm - form object
 * @returns {Object} a plain object of payment instrument
 */
function getDetailsObject(paymentForm) {
    return {
        name: paymentForm.cardOwner.value,
        cardNumber: paymentForm.cardNumber.value,
        cardType: paymentForm.cardType.value,
        expirationMonth: paymentForm.expirationMonth.value,
        expirationYear: paymentForm.expirationYear.value,
        paymentForm: paymentForm
    };
}

/**
 * Creates a list of expiration years from the current year
 * @returns {List} a plain list of expiration years from current year
 */
function getExpirationYears() {
    var currentYear = new Date().getFullYear();
    var creditCardExpirationYears = [];

    for (var i = 0; i < 10; i++) {
        creditCardExpirationYears.push((currentYear + i).toString());
    }

    return creditCardExpirationYears;
}

/**
 * PaymentInstruments-List : The endpoint PaymentInstruments-List is the endpoint that renders a list of shopper saved payment instruments. The rendered list displays the masked card number expiration data and payemnt instrument type
 * @name Base/PaymentInstruments-List
 * @function
 * @memberof PaymentInstruments
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {middleware} - consentTracking.consent
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('List', userLoggedIn.validateLoggedIn, consentTracking.consent, function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var Resource = require('dw/web/Resource');
    var AccountModel = require('*/cartridge/models/account');

    var paymentInstruments = AccountModel.getCustomerPaymentInstruments(
        req.currentCustomer.wallet.paymentInstruments
    );

    res.render('account/payment/payment', {
        paymentInstruments: paymentInstruments,
        noSavedPayments: paymentInstruments.length === 0,
        actionUrl: URLUtils.url('PaymentInstruments-DeletePayment').toString(),
        addPaymentUrl: URLUtils.url('PaymentInstruments-AddPayment').toString(),
        breadcrumbs: [
            {
                htmlValue: Resource.msg('global.home', 'common', null),
                url: URLUtils.home().toString()
            },
            {
                htmlValue: Resource.msg('page.title.myaccount', 'account', null),
                url: URLUtils.url('Account-Show').toString()
            }
        ]
    });
    next();
});

/**
 * PaymentInstruments-AddPayment : The endpoint PaymentInstruments-AddPayment endpoint renders the page that allows a shopper to save a payment instrument to their account
 * @name Base/PaymentInstruments-AddPayment
 * @function
 * @memberof PaymentInstruments
 * @param {middleware} - csrfProtection.generateToken
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get(
    'AddPayment',
    csrfProtection.generateToken,
    consentTracking.consent,
    userLoggedIn.validateLoggedIn,
    function (req, res, next) {
        var URLUtils = require('dw/web/URLUtils');
        var Resource = require('dw/web/Resource');

        var creditCardExpirationYears = getExpirationYears();
        var paymentForm = server.forms.getForm('creditCard');
        paymentForm.clear();
        var months = paymentForm.expirationMonth.options;
        for (var j = 0, k = months.length; j < k; j++) {
            months[j].selected = false;
        }
        res.render('account/payment/addPayment', {
            paymentForm: paymentForm,
            expirationYears: creditCardExpirationYears,
            breadcrumbs: [
                {
                    htmlValue: Resource.msg('global.home', 'common', null),
                    url: URLUtils.home().toString()
                },
                {
                    htmlValue: Resource.msg('page.title.myaccount', 'account', null),
                    url: URLUtils.url('Account-Show').toString()
                },
                {
                    htmlValue: Resource.msg('page.heading.payments', 'payment', null),
                    url: URLUtils.url('PaymentInstruments-List').toString()
                }
            ]
        });

        next();
    }
);

/**
 * PaymentInstruments-SavePayment : The PaymentInstruments-SavePayment endpoint is the endpoit responsible for saving a shopper's payment to their account
 * @name Base/PaymentInstruments-SavePayment
 * @function
 * @memberof PaymentInstruments
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {querystringparameter} - UUID - the universally unique identifier of the payment instrument
 * @param {httpparameter} - dwfrm_creditCard_cardType - Input field credit card type (example visa)
 * @param {httpparameter} - paymentOption-Credit - Radio button, They payment instrument type (credit card is the only one subborted OOB with SFRA)
 * @param {httpparameter} - dwfrm_creditCard_cardOwner -  Input field, the name on the credit card
 * @param {httpparameter} - dwfrm_creditCard_cardNumber -  Input field, the credit card number
 * @param {httpparameter} - dwfrm_creditCard_expirationMonth -  Input field, the credit card's expiration month
 * @param {httpparameter} - dwfrm_creditCard_expirationYear -  Input field, the credit card's expiration year
 * @param {httpparameter} - makeDefaultPayment - Checkbox for whether or not a shopper wants to enbale the payment instrument as the default (This feature does not exist in SFRA OOB)
 * @param {httpparameter} - csrf_token - hidden input field CSRF token
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post('SavePayment', csrfProtection.validateAjaxRequest, function (req, res, next) {
    var formErrors = require('*/cartridge/scripts/formErrors');
    var HookMgr = require('dw/system/HookMgr');
    var PaymentMgr = require('dw/order/PaymentMgr');
    var dwOrderPaymentInstrument = require('dw/order/PaymentInstrument');
    var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');

    var paymentForm = server.forms.getForm('creditCard');
    var result = getDetailsObject(paymentForm);

    if (paymentForm.valid && !verifyCard(req, result, paymentForm)) {
        res.setViewData(result);
        this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
            var URLUtils = require('dw/web/URLUtils');
            var CustomerMgr = require('dw/customer/CustomerMgr');
            var Transaction = require('dw/system/Transaction');

            var formInfo = res.getViewData();
            var customer = CustomerMgr.getCustomerByCustomerNumber(
                req.currentCustomer.profile.customerNo
            );
            var wallet = customer.getProfile().getWallet();

            Transaction.wrap(function () {
                var paymentInstrument = wallet.createPaymentInstrument(dwOrderPaymentInstrument.METHOD_CREDIT_CARD);
                paymentInstrument.setCreditCardHolder(formInfo.name);
                paymentInstrument.setCreditCardNumber(formInfo.cardNumber);
                paymentInstrument.setCreditCardType(formInfo.cardType);
                paymentInstrument.setCreditCardExpirationMonth(formInfo.expirationMonth);
                paymentInstrument.setCreditCardExpirationYear(formInfo.expirationYear);

                var processor = PaymentMgr.getPaymentMethod(dwOrderPaymentInstrument.METHOD_CREDIT_CARD).getPaymentProcessor();
                var token = HookMgr.callHook(
                    'app.payment.processor.' + processor.ID.toLowerCase(),
                    'createToken'
                );

                paymentInstrument.setCreditCardToken(token);
            });

            // Send account edited email
            accountHelpers.sendAccountEditedEmail(customer.profile);

            res.json({
                success: true,
                redirectUrl: URLUtils.url('PaymentInstruments-List').toString()
            });
        });
    } else {
        res.json({
            success: false,
            fields: formErrors.getFormErrors(paymentForm)
        });
    }
    return next();
});

/**
 * PaymentInstruments-DeletePayment : The PaymentInstruments-DeletePayment is the endpoint responsible for deleting a shopper's saved payment instrument from their account
 * @name Base/PaymentInstruments-DeletePayment
 * @function
 * @memberof PaymentInstruments
 * @param {middleware} - userLoggedIn.validateLoggedInAjax
 * @param {querystringparameter} - UUID - the universally unique identifier of the payment instrument to be removed from the shopper's account
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - get
 */
server.get('DeletePayment', userLoggedIn.validateLoggedInAjax, function (req, res, next) {
    var array = require('*/cartridge/scripts/util/array');
    var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');

    var data = res.getViewData();
    if (data && !data.loggedin) {
        res.json();
        return next();
    }

    var UUID = req.querystring.UUID;
    var paymentInstruments = req.currentCustomer.wallet.paymentInstruments;
    var paymentToDelete = array.find(paymentInstruments, function (item) {
        return UUID === item.UUID;
    });
    res.setViewData(paymentToDelete);
    this.on('route:BeforeComplete', function () { // eslint-disable-line no-shadow
        var CustomerMgr = require('dw/customer/CustomerMgr');
        var Transaction = require('dw/system/Transaction');
        var Resource = require('dw/web/Resource');

        var payment = res.getViewData();
        var customer = CustomerMgr.getCustomerByCustomerNumber(
            req.currentCustomer.profile.customerNo
        );
        var wallet = customer.getProfile().getWallet();
        Transaction.wrap(function () {
            wallet.removePaymentInstrument(payment.raw);
        });

        // Send account edited email
        accountHelpers.sendAccountEditedEmail(customer.profile);

        if (wallet.getPaymentInstruments().length === 0) {
            res.json({
                UUID: UUID,
                message: Resource.msg('msg.no.saved.payments', 'payment', null)
            });
        } else {
            res.json({ UUID: UUID });
        }
    });

    return next();
});

/**
 * PaymentInstruments-Header : The PaymentInstruments-Header endpoint is used as a remote include that renders the account header ISML template
 * @name Base/PaymentInstruments-Header
 * @function
 * @memberof PaymentInstruments
 * @param {middleware} - server.middleware.include
 * @param {category} - sensitive
 * @param {renders} -isml
 * @param {serverfunction} - get
 */
server.get('Header', server.middleware.include, function (req, res, next) {
    res.render('account/header', { name:
        req.currentCustomer.profile ? req.currentCustomer.profile.firstName : null
    });
    next();
});

module.exports = server.exports();
