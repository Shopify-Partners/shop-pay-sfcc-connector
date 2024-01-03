'use strict';

/**
 * @namespace PageDesigner
 */

var server = require('server');

var cache = require('*/cartridge/scripts/middleware/cache');

/**
 * PageDesigner-CommerceAssets_ProductTile : Used to return data for rendering a Page Designer component of type 'commerce_assets.productTile'
 * @name Base/PageDesigner-CommerceAssets_ProductTile
 * @function
 * @memberof PageDesigner
 * @param {middleware} - cache.applyPromotionSensitiveCache
 * @param {querystringparameter} - data - the serialized data for the productTile component
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('CommerceAssets_ProductTile', cache.applyPromotionSensitiveCache, function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var ProductFactory = require('*/cartridge/scripts/factories/product');

    var context = JSON.parse(req.querystring.data);
    context.product = ProductFactory.get({ pview: context.pview, pid: context.productID });
    context.urls = {
        product: URLUtils.url('Product-Show', 'pid', context.product.id).relative().toString()
    };

    res.render('experience/components/commerce_assets/product/productTile.isml', context);

    next();
});

/**
 * PageDesigner-CommerceAssets_ShopTheLook : Used to return data for rendering a Page Designer component of type 'commerce_assets.shopTheLook'
 * @name Base/PageDesigner-CommerceAssets_ShopTheLook
 * @function
 * @memberof PageDesigner
 * @param {middleware} - cache.applyPromotionSensitiveCache
 * @param {querystringparameter} - data - the serialized data for the shopTheLook component
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('CommerceAssets_ShopTheLook', cache.applyPromotionSensitiveCache, function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var ProductFactory = require('*/cartridge/scripts/factories/product');

    var context = JSON.parse(req.querystring.data);
    context.product = ProductFactory.get({ pview: context.pview, pid: context.productID });
    context.urls = {
        product: URLUtils.url('Product-Show', 'pid', context.product.id).relative().toString(),
        quickView: URLUtils.url('Product-ShowQuickView', 'pid', context.product.id)
    };
    context.image = context.product.images.medium[0];
    context.itemsCount = context.product.numberOfProductsInSet;

    res.render('experience/components/commerce_assets/shopTheLook.isml', context);

    next();
});

module.exports = server.exports();
