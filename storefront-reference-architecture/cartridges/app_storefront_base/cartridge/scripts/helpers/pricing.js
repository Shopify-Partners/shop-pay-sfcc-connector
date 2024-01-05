'use strict';

var HashMap = require('dw/util/HashMap');
var Template = require('dw/util/Template');
var money = require('dw/value/Money');
var collections = require('*/cartridge/scripts/util/collections');


/**
 * Return root price book for a given price book
 * @param {dw.catalog.PriceBook} priceBook - Provided price book
 * @returns {dw.catalog.PriceBook} root price book
 */
function getRootPriceBook(priceBook) {
    var rootPriceBook = priceBook;
    while (rootPriceBook.parentPriceBook) {
        rootPriceBook = rootPriceBook.parentPriceBook;
    }
    return rootPriceBook;
}

/**
 * Creates a HashMap input object for dw.util.Template.render(HashMap)
 * @param {Object} keyMap - Key-value pairs object
 * @return {dw.util.HashMap} - HashMap from key-value pairs
 */
function getHtmlContext(keyMap) {
    var context = new HashMap();
    Object.keys(keyMap).forEach(function (key) {
        context.put(key, keyMap[key]);
    });
    return context;
}

/**
 * Get a product's promotional price
 *
 * @param {dw.catalog.Product} product - Product under evaluation
 * @param {dw.util.Collection.<dw.campaign.Promotion>} promotions - Promotions that apply to this
 *     product
 * @param {dw.catalog.ProductOptionModel} currentOptionModel - The product's option model
 * @return {dw.value.Money} - Promotional price
 */
function getPromotionPrice(product, promotions, currentOptionModel) {
    var PROMOTION_CLASS_PRODUCT = require('dw/campaign/Promotion').PROMOTION_CLASS_PRODUCT;
    var price = money.NOT_AVAILABLE;
    var promotion = collections.find(promotions, function (promo) {
        return promo.promotionClass && promo.promotionClass.equals(PROMOTION_CLASS_PRODUCT);
    });

    if (promotion) {
        price = currentOptionModel
            ? promotion.getPromotionalPrice(product, currentOptionModel)
            : promotion.getPromotionalPrice(product, product.optionModel);
    }

    return price;
}

/**
 * Render Template HTML
 *
 * @param {dw.util.HashMap} context - Context object that will fill template placeholders
 * @param {string} [templatePath] - Optional template path to override default
 * @return {string} - Rendered HTML
 */
function renderHtml(context, templatePath) {
    var html;
    var path = templatePath || 'product/components/pricing/ajaxMain.isml';
    var tmpl = new Template(path);
    html = tmpl.render(context);

    return html.text;
}

/**
 * Retrieve promotions that apply to current product
 * @param {dw.catalog.ProductSearchHit} searchHit - current product returned by Search API.
 * @param {Array<string>} activePromotions - array of ids of currently active promotions
 * @return {Array<Promotion>} - Array of promotions for current product
 */
function getPromotions(searchHit, activePromotions) {
    var PromotionMgr = require('dw/campaign/PromotionMgr');
    var ArrayList = require('dw/util/ArrayList');

    var productPromotionIds = searchHit.discountedPromotionIDs;

    var promotions = new ArrayList();
    activePromotions.forEach(function (promoId) {
        var index = productPromotionIds.indexOf(promoId);
        if (index > -1) {
            promotions.add(PromotionMgr.getPromotion(productPromotionIds[index]));
        }
    });

    return promotions;
}

/**
 * Get list price for a given product
 * @param {dw.catalog.ProductSearchHit} hit - current product returned by Search API.
 * @param {function} getSearchHit - function to find a product using Search API.
 *
 * @returns {Object} - price for a product
 */
function getListPrices(hit, getSearchHit) {
    var PriceBookMgr = require('dw/catalog/PriceBookMgr');

    var priceModel = hit.firstRepresentedProduct.getPriceModel();
    if (!priceModel.priceInfo) {
        return {};
    }
    var rootPriceBook = getRootPriceBook(priceModel.priceInfo.priceBook);
    if (rootPriceBook.ID === priceModel.priceInfo.priceBook.ID) {
        return { minPrice: hit.minPrice, maxPrice: hit.maxPrice };
    }
    var searchHit;
    var currentApplicablePriceBooks = PriceBookMgr.getApplicablePriceBooks();
    try {
        PriceBookMgr.setApplicablePriceBooks(rootPriceBook);
        searchHit = getSearchHit(hit.product);
    } catch (e) {
        searchHit = hit;
    } finally {
        // Clears price book ID's stored to the session.
        // When switching locales, there is nothing that clears the price book ids stored in the
        // session, so subsequent searches will continue to use the ids from the originally set
        // price books which have the wrong currency.
        if (currentApplicablePriceBooks && currentApplicablePriceBooks.length) {
            PriceBookMgr.setApplicablePriceBooks(currentApplicablePriceBooks.toArray());
        } else {
            PriceBookMgr.setApplicablePriceBooks();
        }
    }

    if (searchHit) {
        if (searchHit.minPrice.available && searchHit.maxPrice.available) {
            return {
                minPrice: searchHit.minPrice,
                maxPrice: searchHit.maxPrice
            };
        }

        return {
            minPrice: hit.minPrice,
            maxPrice: hit.maxPrice
        };
    }

    return {};
}

module.exports = {
    getHtmlContext: getHtmlContext,
    getRootPriceBook: getRootPriceBook,
    renderHtml: renderHtml,
    getPromotionPrice: getPromotionPrice,
    getPromotions: getPromotions,
    getListPrices: getListPrices
};
