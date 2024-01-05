'use strict';

var chai = require('chai');
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

// Merge assert libraries for simplicity, with chai taking precedence
// Only overlap (at this time) is `fail` and `match`
var assert = Object.assign({}, sinon.assert, chai.assert);

var Response = proxyquire('../../../../../cartridges/modules/server/response', {
    '*/cartridge/config/httpHeadersConf': []
});

var CSRFProtection = {
    validateRequest: sinon.stub().returns(false),
    getTokenName: sinon.stub().returns('name'),
    generateToken: sinon.stub().returns('token')
};

var CustomerMgr = {
    logoutCustomer: sinon.stub()
};

var URLUtils = {
    url: sinon.stub()
};

var csrfMiddleware = proxyquire('../../../../../cartridges/app_storefront_base/cartridge/scripts/middleware/csrf', {
    'dw/web/CSRFProtection': CSRFProtection,
    'dw/customer/CustomerMgr': CustomerMgr,
    'dw/web/URLUtils': URLUtils
});

describe('CSRF middleware', function () {
    var res;
    var next = sinon.stub();

    beforeEach(function () {
        res = new Response({});
    });

    afterEach(function () {
        CSRFProtection.validateRequest.reset();
        CSRFProtection.validateRequest.resetBehavior();
        CustomerMgr.logoutCustomer.reset();
        next.reset();
    });

    it('Should validate a request', function () {
        CSRFProtection.validateRequest.returns(true);
        csrfMiddleware.validateRequest(null, res, next);
        assert.calledOnce(CSRFProtection.validateRequest);
        assert.notCalled(CustomerMgr.logoutCustomer);
        assert.calledOnce(next);
    });

    it('Should invalidate a request', function () {
        CSRFProtection.validateRequest.returns(false);
        csrfMiddleware.validateRequest(null, res, next);
        assert.calledOnce(CSRFProtection.validateRequest);
        assert.calledOnce(CustomerMgr.logoutCustomer);
        assert.calledOnce(next);
    });

    it('Should validate an Ajax request', function () {
        CSRFProtection.validateRequest.returns(true);
        csrfMiddleware.validateRequest(null, res, next);
        assert.calledOnce(CSRFProtection.validateRequest);
        assert.notCalled(CustomerMgr.logoutCustomer);
        assert.calledOnce(next);
    });

    it('Should invalidate an Ajax request', function () {
        CSRFProtection.validateRequest.returns(false);
        csrfMiddleware.validateAjaxRequest(null, res, next);
        assert.calledOnce(CSRFProtection.validateRequest);
        assert.calledOnce(CustomerMgr.logoutCustomer);
        assert.calledOnce(next);
    });

    it('Should generate a token', function () {
        assert.isUndefined(res.viewData.csrf);
        csrfMiddleware.generateToken(null, res, next);
        assert.deepEqual(res.viewData.csrf, {
            tokenName: 'name',
            token: 'token'
        });
        assert.calledOnce(next);
    });

    it('should not generate a token if one is already present', function () {
        res.setViewData({
            csrf: {
                tokenName: 'original_name',
                token: 'original_token'
            }
        });
        csrfMiddleware.generateToken(null, res, next);
        assert.deepEqual(res.viewData.csrf, {
            tokenName: 'original_name',
            token: 'original_token'
        });
        assert.calledOnce(next);
    });
});
