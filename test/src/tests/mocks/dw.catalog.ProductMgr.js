const Product = require('../mocks/dw.catalog.Product')

const product = new Product()

const ProductMgr = function () {}

ProductMgr.getProduct = function () {
    return product
}

ProductMgr.getImages = (size) => {
    return product.getImages(size)
}

ProductMgr.queryAllSiteProducts = function () {};
ProductMgr.queryProductsInCatalog = function () {};
ProductMgr.queryAllSiteProductsSorted = function () {};
ProductMgr.queryProductsInCatalogSorted = function () {};
ProductMgr.prototype.product=null;

module.exports = ProductMgr;
