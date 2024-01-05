'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var validateCreditCardStub = sinon.stub();

var paymentInstrumentMock = {
    UUID: 'storedPaymentUUID',
    creditCardNumber: 'creditCardNumber',
    creditCardType: 'creditCardType',
    creditCardExpirationMonth: 'creditCardExpirationMonth',
    creditCardExpirationYear: 'creditCardExpirationYear',
    raw: {
        creditCardToken: 'creditCardToken'
    }
};

var requestLoggedInMock = {
    form: {
        securityCode: 'securityCode',
        storedPaymentUUID: 'storedPaymentUUID'
    },
    currentCustomer: {
        profile: {
            customerNo: 'customer number'
        },
        raw: {
            authenticated: true,
            registered: true
        },
        wallet: {
            paymentInstruments: [paymentInstrumentMock]
        }
    }
};

var paymentFormMock = {
    paymentMethod: {
        value: 'some value'
    },
    creditCardFields: {
        cardType: {
            value: 'some card type value',
            htmlName: 'some card type html name'
        },
        cardNumber: {
            value: 'some card number value',
            htmlName: 'some card number html name'
        },
        securityCode: {
            value: 'some card cvv value',
            htmlName: 'some card cvv html name'
        },
        expirationMonth: {
            selectedOption: '10',
            htmlName: 'some card expiration month html name'
        },
        expirationYear: {
            value: '2018',
            htmlName: 'some card expiration year html name'
        },
        email: {
            value: 'some email value'
        },
        phone: {
            value: 'some phone value'
        },
        saveCard: {
            checked: null
        }
    }
};

describe('basic credit form processor', function () {
    var basicCreditFormProcessor = proxyquire('../../../../../../../cartridges/app_storefront_base/cartridge/scripts/hooks/payment/processor/basic_credit_form_processor', {
        '*/cartridge/scripts/checkout/checkoutHelpers': {
            validateCreditCard: validateCreditCardStub,
            savePaymentInstrumentToWallet: function () {
                return {
                    creditCardHolder: 'creditCardHolder',
                    maskedCreditCardNumber: 'maskedCreditCardNumber',
                    creditCardType: 'creditCardType',
                    creditCardExpirationMonth: 'creditCardExpirationMonth',
                    creditCardExpirationYear: 'creditCardExpirationYear',
                    UUID: 'UUID',
                    creditCardNumber: 'creditCardNumber'
                };
            }
        },
        '*/cartridge/scripts/util/array': {
            find: function () {
                return paymentInstrumentMock;
            }
        },
        'dw/customer/CustomerMgr': {
            getCustomerByCustomerNumber: function () {
                return;
            }
        }
    });
    describe('processForm', function () {
        it('Should process the credit card form for a logged in user with stored payment information', function () {
            var result = basicCreditFormProcessor.processForm(requestLoggedInMock, paymentFormMock, {});
            assert.isFalse(result.error);

            assert.equal(result.viewData.paymentInformation.cardNumber.value, 'creditCardNumber');
            assert.equal(result.viewData.paymentInformation.expirationYear.value, 'creditCardExpirationYear');
            assert.equal(result.viewData.paymentInformation.expirationMonth.value, 'creditCardExpirationMonth');
            assert.equal(result.viewData.paymentInformation.cardType.value, 'creditCardType');
            assert.equal(result.viewData.paymentInformation.securityCode.value, 'securityCode');

            assert.equal(result.viewData.storedPaymentUUID, 'storedPaymentUUID');
        });

        it('Should process the credit card form for a logged in user without stored payment information', function () {
            requestLoggedInMock.form.storedPaymentUUID = null;
            validateCreditCardStub.returns({});
            var result = basicCreditFormProcessor.processForm(requestLoggedInMock, paymentFormMock, {});

            assert.isFalse(result.error);

            assert.equal(result.viewData.paymentInformation.cardNumber.value, 'some card number value');
            assert.equal(result.viewData.paymentInformation.expirationYear.value, '2018');
            assert.equal(result.viewData.paymentInformation.expirationMonth.value, '10');
            assert.equal(result.viewData.paymentInformation.cardType.value, 'some card type value');
            assert.equal(result.viewData.paymentInformation.securityCode.value, 'some card cvv value');

            assert.equal(result.viewData.storedPaymentUUID, null);
        });

        it('Should return an error when there is a invalid credit card', function () {
            requestLoggedInMock.form.storedPaymentUUID = null;
            validateCreditCardStub.returns({ error: 'badError' });
            var result = basicCreditFormProcessor.processForm(requestLoggedInMock, paymentFormMock, {});

            assert.isTrue(result.error);

            assert.deepEqual(result.fieldErrors, { error: 'badError' });
        });
    });

    describe('savePaymentInformation', function () {
        var billingDataMock = {
            storedPaymentUUID: 'storedPaymentUUID',
            saveCard: true,
            paymentMethod: {
                value: 'CREDIT_CARD'
            }
        };

        it('Should not save payment information to the customers wallet', function () {
            basicCreditFormProcessor.savePaymentInformation(requestLoggedInMock, {}, billingDataMock);
            assert.equal(requestLoggedInMock.currentCustomer.wallet.paymentInstruments.length, 1);
        });

        it('Should save payment information to the customers wallet', function () {
            billingDataMock.storedPaymentUUID = null;
            basicCreditFormProcessor.savePaymentInformation(requestLoggedInMock, {}, billingDataMock);

            assert.equal(requestLoggedInMock.currentCustomer.wallet.paymentInstruments.length, 2);
        });
    });
});
