/* globals session request */
'use strict';

var PromotionMgr = require('dw/campaign/PromotionMgr');
var collections = require('*/cartridge/scripts/util/collections');

var promotionCache = Object.create(null);

Object.defineProperty(promotionCache, 'promotions', {
    get: function () {
        // will parse the id from the main request and use that as cache key for the promotion cache as the main goal is to ensure that
        // the promotions are just calculated once for the main request (Search) and not all the remote includes.
        // If a new main request comes in it should not be used as eventually applicable promotions have been changed linked to the user.
        var cacheKey = request.requestID.split('-')[0];
        if (session.privacy.promoCache) {
            var cacheObj = JSON.parse(session.privacy.promoCache);
            if (cacheKey === cacheObj.cacheKey) {
                return cacheObj.promoIds;
            }
        }
        var activePromotions = PromotionMgr.activeCustomerPromotions.getProductPromotions();
        var promoIds = collections.map(activePromotions, function (promo) {
            return promo.ID;
        });

        session.privacy.promoCache = JSON.stringify({
            cacheKey: cacheKey,
            promoIds: promoIds
        });
        return promoIds;
    }
});

module.exports = promotionCache;
