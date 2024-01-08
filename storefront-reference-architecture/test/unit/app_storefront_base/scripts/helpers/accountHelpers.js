'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var urlStub = sinon.stub();
var getPrivacyCacheStub = sinon.stub();
var mockedAuthStatus = 'AUTH_OK';
var authErrorMsg = 'NOT_EMPTY_STRING';

describe('accountHelpers', function () {
    var accoutHelpers = proxyquire('../../../../../cartridges/app_storefront_base/cartridge/scripts/helpers/accountHelpers', {
        'dw/web/URLUtils': {
            url: urlStub
        },
        '*/cartridge/config/oAuthRenentryRedirectEndpoints': {
            1: 'Account-Show',
            2: 'Checkout-Begin'
        },
        'dw/system/Transaction': {
            wrap: function (callback) {
                return callback();
            }
        },
        'dw/customer/CustomerMgr': {
            authenticateCustomer: function () {
                return { status: mockedAuthStatus, customer: { }, loginCustomer: function () {} };
            },
            loginCustomer: function () {}
        },
        'dw/web/Resource': {
            msg: function () {
                return authErrorMsg;
            }
        }
    });

    var privacyCache = {
        get: getPrivacyCacheStub
    };

    beforeEach(function () {
        urlStub.reset();
        urlStub.returns({
            relative: function () {
                return {
                    toString: function () {
                        return 'string url';
                    }
                };
            }
        });
        getPrivacyCacheStub.reset();
    });

    it('should return a url with no args and registration false when no redirect url is passed in', function () {
        getPrivacyCacheStub.returns(null);

        var result = accoutHelpers.getLoginRedirectURL(null, privacyCache, false);

        assert.isTrue(urlStub.calledOnce);
        assert.isTrue(urlStub.calledWith('Account-Show', 'registration', 'false'));
        assert.equal(result, 'string url');
    });

    it('should return a url with no args and registration true when no redirect url is passed in', function () {
        getPrivacyCacheStub.returns(null);

        var result = accoutHelpers.getLoginRedirectURL(null, privacyCache, true);

        assert.isTrue(urlStub.calledOnce);
        assert.isTrue(urlStub.calledWith('Account-Show', 'registration', 'submitted'));
        assert.equal(result, 'string url');
    });

    it('should return a url with args and registration false when no redirect url is passed in', function () {
        getPrivacyCacheStub.returns('args');

        var result = accoutHelpers.getLoginRedirectURL(null, privacyCache, false);

        assert.isTrue(urlStub.calledOnce);
        assert.isTrue(urlStub.calledWith('Account-Show', 'registration', 'false', 'args', 'args'));
        assert.equal(result, 'string url');
    });

    it('should return a url with args and registration submitted when no redirect url is passed in', function () {
        getPrivacyCacheStub.returns('args');

        var result = accoutHelpers.getLoginRedirectURL(null, privacyCache, true);

        assert.isTrue(urlStub.calledOnce);
        assert.isTrue(urlStub.calledWith('Account-Show', 'registration', 'submitted', 'args', 'args'));
        assert.equal(result, 'string url');
    });

    it('should return a url with args and registration submitted when redirect url is passed in', function () {
        getPrivacyCacheStub.returns('args');

        var result = accoutHelpers.getLoginRedirectURL('1', privacyCache, true);

        assert.isTrue(urlStub.calledOnce);
        assert.isTrue(urlStub.calledWith('Account-Show', 'registration', 'submitted', 'args', 'args'));
        assert.equal(result, 'string url');
    });

    it('should return no error on sucessfully authenticated customer', function () {
        getPrivacyCacheStub.returns('args');
        var email = 'ok@salesforce.com';
        var password = '122345';
        var rememberMe = false;

        var result = accoutHelpers.loginCustomer(email, password, rememberMe);
        assert.isFalse(result.error);
    });

    it('should return an error on not-sucessfully authenticated customer and an error message', function () {
        getPrivacyCacheStub.returns('args');
        var email = 'ok@salesforce.com';
        var password = '122345';
        var rememberMe = false;
        mockedAuthStatus = 'AUTH_NOT_OK';

        var result = accoutHelpers.loginCustomer(email, password, rememberMe);
        assert.isTrue(result.error);
        assert.equal(result.errorMessage, authErrorMsg);
    });
});
