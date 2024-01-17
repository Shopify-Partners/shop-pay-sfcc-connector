const ProductMgr = function () {};

ProductMgr.getProduct = function () {
    const productClass = require('../mocks/dw.catalog.Product');
    const product = new productClass();
    return product;
};

ProductMgr.queryAllSiteProducts = function () {};
ProductMgr.queryProductsInCatalog = function () {};
ProductMgr.queryAllSiteProductsSorted = function () {};
ProductMgr.queryProductsInCatalogSorted = function () {};
ProductMgr.prototype.product=null;

module.exports = ProductMgr;
