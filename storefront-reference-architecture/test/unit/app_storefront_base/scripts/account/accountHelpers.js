'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var accountHelpers = proxyquire('../../../../../cartridges/app_storefront_base/cartridge/scripts/account/accountHelpers', {
    '*/cartridge/models/account': function () {
        return {
            email: 'abc@test.com'
        };
    },
    '*/cartridge/models/address': function () {
        return {};
    },
    '*/cartridge/scripts/order/orderHelpers': {
        getLastOrder: function () {
            return {};
        }
    }
});

describe('orderHelpers', function () {
    describe('getAccountModel', function () {
        it('should return an account model', function () {
            var req = {
                currentCustomer: {
                    profile: {
                        email: 'abc@test.com'
                    },
                    addressBook: {
                        preferredAddress: {
                            address1: '5 Wall St.'
                        }
                    }
                }
            };

            var accountModel = accountHelpers.getAccountModel(req);
            assert.equal(accountModel.email, 'abc@test.com');
        });

        it('should return null as account model if customer profile is null', function () {
            var req = {
                currentCustomer: {}
            };

            var accountModel = accountHelpers.getAccountModel(req);
            assert.isNull(accountModel);
        });

        it('should return an account model when no preferredAddress', function () {
            var req = {
                currentCustomer: {
                    profile: {
                        email: 'abc@test.com'
                    },
                    addressBook: {}
                }
            };

            var accountModel = accountHelpers.getAccountModel(req);
            assert.equal(accountModel.email, 'abc@test.com');
        });
    });
});
