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

function getBuyNowData(sku, quantity, options) {
    var shippingMethod = ShippingMgr.defaultShippingMethod;

    var optionsArray;
    if (options) {
        optionsArray = options.map(function (option) {
            return {
                id: option.id,
                valueId: option.selectedValueId
            };
        });
    } else {
        optionsArray = [];
    }

    // Create a temporary basket for payment request options calculation
    var basket = Transaction.wrap(BasketMgr.createTemporaryBasket);

    var paymentRequest = Transaction.wrap(function () {
        try {
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

            // Set shipment shipping method
            shippingHelpers.selectShippingMethod(basket.defaultShipment, shippingMethod.ID);

            // Calculate basket
            basketCalculationHelpers.calculateTotals(basket);

            // Calculate the payment request options for the basket
            return new PaymentRequestModel(basket);
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
    createBuyNowBasket: createBuyNowBasket,
    getBuyNowData: getBuyNowData
}
