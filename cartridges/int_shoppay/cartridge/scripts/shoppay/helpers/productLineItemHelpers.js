'use strict';

var collections = require('*/cartridge/scripts/util/collections');
var ImageModel = require('*/cartridge/models/product/productImages');
var shoppayGlobalRefs = require('*/cartridge/scripts/shoppayGlobalRefs');

function getProductImage(product, viewType) {
    var ImageModel = require('*/cartridge/models/product/productImages');
    var images = new ImageModel(product, { types: [viewType], quantity: 'single' });
    if (!images[viewType] || images[viewType].length == 0) {
        return {
            url: "",
            alt: ""
        };
    }

    var image = images[viewType][0];
    return {
        url: image.absURL,
        alt: image.alt
    }
}

function getLineItems(basket) {
    var lineItems = [];
    var viewType = shoppayGlobalRefs.shoppayModalImageViewType;
    collections.forEach(basket.productLineItems, function (pli) {
        var lineItem = {};
        var product = pli.product;
        lineItem.label = product.name;
        lineItem.quantity = pli.quantityValue;
        lineItem.sku = pli.productID;
        // Kristin TODO: Add handling for e-delivery
        lineItem.requiresShipping = true;
        lineItem.image = getProductImage(product, viewType);

        // Kristin TODO: Add dynamic logic for the hard-coded elements below
        lineItem.originalItemPrice = {
            amount: 10.00,
            currencyCode: "USD"
        };
        lineItem.itemDiscounts = [];
        lineItem.finalItemPrice = {
            amount: 10.00,
            currencyCode: "USD"
        };
        lineItem.originalLinePrice = {
            amount: 20.00,
            currencyCode: "USD"
        };
        lineItem.lineDiscounts = [];
        lineItem.finalLinePrice = {
            amount: 20.00,
            currencyCode: "USD"
        };

        lineItems.push(lineItem);
    });
    return lineItems;
}

module.exports = {
    getLineItems: getLineItems
}
