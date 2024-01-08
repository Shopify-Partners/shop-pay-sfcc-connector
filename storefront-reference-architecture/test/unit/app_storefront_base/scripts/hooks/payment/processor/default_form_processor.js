'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('default form processor hook', function () {
    var defaultFormProcessor = proxyquire('../../../../../../../cartridges/app_storefront_base/cartridge/scripts/hooks/payment/processor/default_form_processor', {
        'dw/web/Resource': {
            msg: function () {
                return 'someString';
            }
        }
    });

    describe('processForm', function () {
        it('should call the default processForm function and return server errors ', function () {
            var result = defaultFormProcessor.processForm();

            assert.equal(result.fieldErrors.length, 0);
            assert.equal(result.serverErrors.length, 1);
            assert.equal(result.serverErrors[0], 'someString');
            assert.isTrue(result.error);
        });
    });

    describe('savePaymentInformation', function () {
        it('should call the default savePaymentInformation function', function () {
            var result = defaultFormProcessor.savePaymentInformation();
            assert.equal(result, undefined);
        });
    });
});
