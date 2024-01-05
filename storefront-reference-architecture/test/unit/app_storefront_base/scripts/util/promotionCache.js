
const { assert } = require('chai');
const sinon = require('sinon');

const proxyquire = require('proxyquire').noCallThru().noPreserveCache();

const collections = require('../../../../mocks/util/collections');
const Collection = require('../../../../mocks/dw.util.Collection');

const getProductPromotionsStub = sinon.stub();
const MockActiveCustomerPromotions = {
    getProductPromotions: getProductPromotionsStub
};

const MockPromotionMgr = {
    activeCustomerPromotions: MockActiveCustomerPromotions
};

const PromotionCache = proxyquire('../../../../../cartridges/app_storefront_base/cartridge/scripts/util/promotionCache', {
    'dw/campaign/PromotionMgr': MockPromotionMgr,
    '*/cartridge/scripts/util/collections': collections
});

describe('promotionCache', () => {
    afterEach(() => {
        delete global.session;
        delete global.request;
    });
    describe('get promotion cache from Session when available for current main request', () => {
        before(() => {
            global.session = {
                privacy: {
                    promoCache: JSON.stringify({
                        cacheKey: 'ABCD',
                        promoIds: ['promoIds']
                    })
                } };
            global.request = {
                requestID: 'ABCD-10-12'
            };
        });

        it('should get promo ids from session', () => {
            const promotions = PromotionCache.promotions;
            assert.deepEqual(promotions, ['promoIds']);
        });
    });

    describe('not use session cache and fetch promotions', () => {
        beforeEach(() => {
            global.session = {
                privacy: {}
            };
            global.request = {
                requestID: ''
            };
        });

        afterEach(() => {
            getProductPromotionsStub.reset();
        });

        it('should ignore promotion cache from Session when it is a new main request', () => {
            global.session = {
                privacy: {
                    promoCache: JSON.stringify({
                        cacheKey: 'KEY',
                        promoIds: ['promoIds']
                    })
                }
            };

            global.request = {
                requestID: 'OTHERKEY-10-12'
            };

            const sessionValidation = {
                privacy: {
                    promoCache: JSON.stringify({
                        cacheKey: 'OTHERKEY',
                        promoIds: ['A', 'B', 'C']
                    })
                }
            };

            getProductPromotionsStub.returns(new Collection([{ ID: 'A' }, { ID: 'B' }, { ID: 'C' }]));

            const promotions = PromotionCache.promotions;

            assert.deepEqual(promotions, ['A', 'B', 'C']);
            assert.deepEqual(global.session, sessionValidation);
        });

        it('should fetch promos when no promo cache', () => {
            global.request = {
                requestID: 'OTHERKEY-10-12'
            };

            const sessionValidation = {
                privacy: {
                    promoCache: JSON.stringify({
                        cacheKey: 'OTHERKEY',
                        promoIds: ['A', 'B', 'C']
                    })
                }
            };
            getProductPromotionsStub.returns(new Collection([{ ID: 'A' }, { ID: 'B' }, { ID: 'C' }]));
            const promotions = PromotionCache.promotions;

            assert.deepEqual(promotions, ['A', 'B', 'C']);
            assert.deepEqual(global.session, sessionValidation);
        });
    });
});
