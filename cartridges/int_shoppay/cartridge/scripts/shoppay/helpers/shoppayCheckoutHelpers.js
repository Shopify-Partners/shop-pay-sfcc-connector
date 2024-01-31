'use strict'

var BasketMgr = require('dw/order/BasketMgr');
var ShippingMgr = require('dw/order/ShippingMgr');
var Transaction = require('dw/system/Transaction');

var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
var PaymentRequestModel = require('*/cartridge/models/paymentRequest');
var shippingHelpers = require('*/cartridge/scripts/checkout/shippingHelpers');

/**
 * Creates a temporary basket to use for Buy Now.
 * @returns {dw.order.Basket} basket to use for Buy Now
 */
function createBuyNowBasket() {
    // Delete any existing open temporary baskets
    BasketMgr.getTemporaryBaskets().toArray().forEach(function (basket) {
        BasketMgr.deleteTemporaryBasket(basket);
    });

    // Create a new temporary basket
    return BasketMgr.createTemporaryBasket();
}

function addProductToTempBasket(product, basket) {
    var sku = product.pid;
    var options = product.options;
    var quantity = product.quantity;
    var childProducts = product.childProducts;
    var optionsArray;
    try {
        if (options && options.length > 0) {
            optionsArray = options.map(function (option) {
                return {
                    id: option.id,
                    valueId: option.selectedValueId
                };
            });
        } else {
            optionsArray = [];
        }
        var result = Transaction.wrap(function () {
            // Add product line item
            var pli = basket.createProductLineItem(sku, basket.defaultShipment);
            pli.setQuantityValue(quantity);

            // Update product line item option model
            var optionModel = pli.optionModel;
            optionsArray.forEach(function (option) {
                var productOption = optionModel.getOption(option.id);
                if (productOption) {
                    var productOptionValue = optionModel.getOptionValue(productOption, option.valueId);
                    if (productOptionValue) {
                        // Update selected value for product option
                        optionModel.setSelectedOptionValue(productOption, productOptionValue);
                    }
                }
            });
        });
    } catch (e) {
        var test = e;
        dw.system.Logger.error(e.message);
        return {
            error: true,
            errorMsg: e.message
        };
    }
    return {
        success: true,
        errorMsg: null
    };
}

function getBuyNowData(product) {
    // Create a temporary basket for payment request options calculation
    var basket = Transaction.wrap(createBuyNowBasket);
    var shippingMethod = ShippingMgr.defaultShippingMethod;

    // Kristin TODO: Consider using OOTB cartHelper.js: addProductToCart for final version
    var result;
    var paymentRequest;
    if (product.pidsObj && product.pidsObj.length > 0) {
        pidsObj.forEach(function (PIDObj) {
            var PIDObjResult = addProductToTempBasket(product, basket);
            if (PIDObjResult.error) {
                result.error = PIDObjResult.error;
                result.message = PIDObjResult.message;
            }
        });
    } else {
        result = addProductToTempBasket(product, basket);
    }

    Transaction.wrap(function () {
        try {
            // Set shipment shipping method
            shippingHelpers.selectShippingMethod(basket.defaultShipment, shippingMethod.ID);

            // Calculate basket
            basketCalculationHelpers.calculateTotals(basket);
            paymentRequest = new PaymentRequestModel(basket);
        } catch (e) {
            var test = e;
            dw.system.Logger.error(e.message);
        } finally {
            // Delete temporary basket after calculation
            BasketMgr.deleteTemporaryBasket(basket);
        }
    });
    return paymentRequest;
}

module.exports = {
    addProductToTempBasket: addProductToTempBasket,
    createBuyNowBasket: createBuyNowBasket,
    getBuyNowData: getBuyNowData
}
