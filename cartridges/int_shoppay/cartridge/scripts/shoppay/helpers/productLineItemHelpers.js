'use strict';

var collections = require('*/cartridge/scripts/util/collections');
var ImageModel = require('*/cartridge/models/product/productImages');
var priceFactory = require('*/cartridge/scripts/factories/price');
var shoppayGlobalRefs = require('*/cartridge/scripts/shoppayGlobalRefs');
var eDeliveryHelpers = require('*/cartridge/scripts/shoppay/helpers/eDeliveryHelpers');
var common = require('*/cartridge/scripts/shoppay/shoppayCommon');

/**
 * Gets the absolute image URL and alt text for a product to display in the Shop Pay modal
 * @param {dw.catalog.Product} product
 * @param {string} viewType
 * @returns {Object} raw JSON representing the product image data
 */
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

/**
 * Sums the price of the selected product options as the platform does not include prices for
 * selected option values in a line item's price by default.
 * @param {dw.order.ProductLineItem} pli - the target product line item
 * @returns {dw.value.Money} The sum of the prices of the selected product options
 */
function getOptionPricing(pli) {
    var Money = require('dw/value/Money');
    var price = new Money(0, pli.netPrice.currencyCode);
    collections.forEach(pli.optionProductLineItems, function (item) {
        price = price.add(item.adjustedPrice);
    });
    return price;
}

/**
 * Plain JS object that represents product line item pricing including discounts, when applicable
 * @param {dw.order.ProductLineItem} pli - the target product line item
 * @returns {Object} raw JSON representing the pricing of a line item in the current basket
 */
function getLineItemPricing(pli) {
    var lineItemPrice = {};
    var netPrice = pli.getNetPrice();
    var adjustedNetPrice = pli.getAdjustedNetPrice();
    if (pli.optionProductLineItems.length > 0) {
        var totalOptionsPrice = getOptionPricing(pli);
        netPrice = netPrice.add(totalOptionsPrice);
        adjustedNetPrice = adjustedNetPrice.add(totalOptionsPrice);
    }
    if (pli.priceAdjustments.length > 0) {
        lineItemPrice.originalLinePrice = common.getPriceObject(netPrice);
        lineItemPrice.lineDiscounts = common.getDiscountsObject(pli.priceAdjustments);
    } else {
        lineItemPrice.originalLinePrice = common.getPriceObject(adjustedNetPrice);
    }
    lineItemPrice.finalLinePrice = common.getPriceObject(adjustedNetPrice);

    return lineItemPrice;
}

/**
 * Plain JS object that represents unit pricing for a product line item in the current basket. Discounts
 * are applied at the product line item level so item discounts are omitted. Original price is the
 * list price if the product is on sale, otherwise omitted. Final price is the sale price if the item
 * is on sale, otherwise the list price.
 * @param {dw.order.ProductLineItem} pli - the target product line item
 * @returns {Object} raw JSON representing the unit pricing of a line item in the current basket
 */
function getItemPricing(pli) {
    // unit prices and sale pricing
    var PromotionMgr = require('dw/campaign/PromotionMgr');
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var promotions = PromotionMgr.activeCustomerPromotions.getProductPromotions(pli.product);
    var optionModelPLI = pli.product.optionModel;
    var optionLineItemsPLI = pli.optionProductLineItems;
    var currentOptionModelPLI = productHelper.getCurrentOptionModel(
        optionModelPLI,
        productHelper.getLineItemOptions(optionLineItemsPLI, pli.productID)
    );

    var priceFactoryPricing = priceFactory.getPrice(pli.product, pli.price.currencyCode, false, promotions, currentOptionModelPLI);
    var itemPrice = {};
    if (priceFactoryPricing.list !== null) {
        itemPrice.originalItemPrice = {
            amount: priceFactoryPricing.list.value,
            currencyCode: priceFactoryPricing.list.currency
        };
        itemPrice.finalItemPrice = {
            amount: priceFactoryPricing.sales.value,
            currencyCode: priceFactoryPricing.sales.currency
        };
    } else {
        itemPrice.originalItemPrice = {
            amount: priceFactoryPricing.sales.value,
            currencyCode: priceFactoryPricing.sales.currency
        };
        itemPrice.finalItemPrice = {
            amount: priceFactoryPricing.sales.value,
            currencyCode: priceFactoryPricing.sales.currency
        };
    }

    return itemPrice;
}

/**
 * Plain JS object that represents the product line items of the current basket
 * @param {dw.order.LineItemCtnr} basket - the current line item container
 * @returns {Object} raw JSON representing the line items in the current basket
 */
function getLineItems(basket) {
    var lineItems = [];
    var viewType = shoppayGlobalRefs.shoppayModalImageViewType;
    // Product Line Items
    collections.forEach(basket.productLineItems, function (pli) {
        var lineItem = {};
        var product = pli.product;
        lineItem.label = product.name;
        lineItem.quantity = pli.quantityValue;
        lineItem.sku = pli.productID;
        lineItem.requiresShipping = eDeliveryHelpers.isEDeliveryItem(lineItem) == true ? false : true;
        lineItem.image = getProductImage(product, viewType);

        // line item prices and discounts
        var lineItemPricing = getLineItemPricing(pli);
        Object.assign(lineItem, lineItemPricing);

        // unit pricing including sale vs list prices
        var itemPricing = getItemPricing(pli);
        Object.assign(lineItem, itemPricing);

        lineItems.push(lineItem);
    });

    // Gift Certificate Line Items
    collections.forEach(basket.giftCertificateLineItems, function (gcli) {
        var lineItem = {};
        lineItem.label = gcli.lineItemText;
        lineItem.quantity = 1;
        lineItem.requiresShipping = false;
        // discounts and multi-quantity are not applicable to Gift Certificate Line Items
        lineItem.finalItemPrice = common.getPriceObject(gcli.netPrice);
        lineItem.finalLinePrice = common.getPriceObject(gcli.netPrice);

        lineItems.push(lineItem);
    })

    return lineItems;
}

module.exports = {
    getLineItems: getLineItems
};
