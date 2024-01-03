'use strict';

var chai = require('chai');
var chaiSubset = require('chai-subset');
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var SimpleCache = require('../../../../../cartridges/modules/server/simpleCache');
var assert = chai.assert;

chai.use(chaiSubset);

var csrfProtection = proxyquire('../../../../../cartridges/app_storefront_base/cartridge/scripts/middleware/csrf', {
    'dw/web/CSRFProtection': {
        getTokenName: sinon.stub().returns('token_name'),
        generateToken: sinon.stub().returns('token_value')
    },
    'dw/customer/CustomerMgr': {},
    'dw/web/URLUtils': {}
});
var consentTracking = proxyquire('../../../../../cartridges/app_storefront_base/cartridge/scripts/middleware/consentTracking', {
    '*/cartridge/scripts/middleware/csrf': csrfProtection
});
var Response = proxyquire('../../../../../cartridges/modules/server/response', {
    '*/cartridge/config/httpHeadersConf': []
});

describe('gdpr consent', function () {
    var req;
    var res;
    var next;
    var key = 'consent';
    beforeEach(function () {
        req = {
            session: {
                privacyCache: new SimpleCache(),
                raw: { setTrackingAllowed: sinon.stub() }
            }
        };
        res = new Response({});
        sinon.spy(res, 'setViewData');
        next = sinon.stub();
    });

    it('Sets the consented flag to null if it has not been set', function () {
        req.session.privacyCache.clear();
        consentTracking.consent(req, res, next);
        assert.isNull(req.session.privacyCache.get(key));
    });

    it('Sets tracking allowed to false if consented is false', function () {
        req.session.privacyCache.set(key, false);
        consentTracking.consent(req, res, next);
        assert(req.session.raw.setTrackingAllowed.calledWith(false));
    });

    it('Sets tracking allowed to true if consented is true', function () {
        req.session.privacyCache.set(key, true);
        consentTracking.consent(req, res, next);
        assert(req.session.raw.setTrackingAllowed.calledWith(true));
    });

    it('Sets tracking view data to false if consented is false', function () {
        req.session.privacyCache.set(key, false);
        consentTracking.consent(req, res, next);
        assert(res.setViewData.calledWith({ tracking_consent: false }));
    });

    it('Sets tracking view data to true if consented is true', function () {
        req.session.privacyCache.set(key, true);
        consentTracking.consent(req, res, next);
        assert(res.setViewData.calledWith({ tracking_consent: true }));
    });

    it('Adds a CSRF token if one is not present', function () {
        assert.isUndefined(res.getViewData().csrf);
        consentTracking.consent(req, res, next);
        assert.containSubset(res.getViewData(), {
            csrf: {
                tokenName: 'token_name',
                token: 'token_value'
            }
        });
        assert.isTrue(next.calledOnce);
    });

    it('Does not add a CSRF token if one is already present', function () {
        res.setViewData({
            csrf: {
                tokenName: 'existing_name',
                token: 'existing_value'
            }
        });
        consentTracking.consent(req, res, next);
        assert.containSubset(res.getViewData(), {
            csrf: {
                tokenName: 'existing_name',
                token: 'existing_value'
            }
        });
        assert.isTrue(next.calledOnce);
    });
});
