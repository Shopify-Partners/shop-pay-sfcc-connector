'use strict'

/* Script Modules */
var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
var collections = require('*/cartridge/scripts/util/collections');
var common = require('*/cartridge/scripts/shoppay/shoppayCommon');
var PaymentRequestModel = require('*/cartridge/models/paymentRequest');
var shippingHelpers = require('*/cartridge/scripts/checkout/shippingHelpers');

/* API Includes */
var BasketMgr = require('dw/order/BasketMgr');
var Logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');
var ShippingMgr = require('dw/order/ShippingMgr');
var Transaction = require('dw/system/Transaction');

/**
 * Ensures that no shipment exists with 0 product line items in the customer's basket.
 * This method differs from the OOTB SFRA ensureNoEmptyShipments only in that it takes in
 * the currentBasket to ensure that in Buy Now situations the temporary basket is checked
 * rather than the standard basket.
 * @param {dw.order.LineItemCtnr} currentBasket - the target basket
 * @param {Object} req - the request object needed to access session.privacyCache
 */
function ensureNoEmptyShipments(currentBasket, req) {
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    Transaction.wrap(function () {
        var iter = currentBasket.shipments.iterator();
        var shipment;
        var shipmentsToDelete = [];

        while (iter.hasNext()) {
            shipment = iter.next();
            if (shipment.productLineItems.length < 1 && shipmentsToDelete.indexOf(shipment) < 0) {
                if (shipment.default) {
                    // Cant delete the defaultShipment. Copy all line items from 2nd to first
                    var altShipment = COHelpers.getFirstNonDefaultShipmentWithProductLineItems(currentBasket);
                    if (!altShipment) return;

                    // Move the valid marker with the shipment
                    var altValid = req.session.privacyCache.get(altShipment.UUID);
                    req.session.privacyCache.set(currentBasket.defaultShipment.UUID, altValid);

                    collections.forEach(altShipment.productLineItems,
                        function (lineItem) {
                            lineItem.setShipment(currentBasket.defaultShipment);
                        });

                    if (altShipment.shippingAddress) {
                        // Copy from other address
                        var addressModel = new AddressModel(altShipment.shippingAddress);
                        COHelpers.copyShippingAddressToShipment(addressModel, currentBasket.defaultShipment);
                    } else {
                        // Or clear it out
                        currentBasket.defaultShipment.createShippingAddress();
                    }

                    if (altShipment.custom && altShipment.custom.fromStoreId && altShipment.custom.shipmentType) {
                        currentBasket.defaultShipment.custom.fromStoreId = altShipment.custom.fromStoreId;
                        currentBasket.defaultShipment.custom.shipmentType = altShipment.custom.shipmentType;
                    }

                    currentBasket.defaultShipment.setShippingMethod(altShipment.shippingMethod);
                    // then delete 2nd one
                    shipmentsToDelete.push(altShipment);
                } else {
                    shipmentsToDelete.push(shipment);
                }
            }
        }

        for (var j = 0, jj = shipmentsToDelete.length; j < jj; j++) {
            currentBasket.removeShipment(shipmentsToDelete[j]);
        }
    });
}

/**
 * Compares the paymentRequest from the Shop Pay client-side session to a paymentRequest generated
 * from the associated SFCC basket to ensure consistency before finalizing payment and placing the
 * order.
 * @param {Object} clientRequest - the paymentRequest object from the Shop Pay modal session
 * @param {Object} serverRequest - the paymentRequest object for the associated SFCC cart
 * @returns {boolean} true if the paymentRequest objects are a match, otherwise false
 */
function validatePaymentRequest(clientRequest, serverRequest) {
    try {
        // Append attributes to the server request that are provided only by Shop Pay before comparing
        if (clientRequest.paymentMethod && !serverRequest.paymentMethod) {
            serverRequest.paymentMethod = clientRequest.paymentMethod;
        }
        if (clientRequest.shippingAddress.id && !serverRequest.shippingAddress.id) {
            serverRequest.shippingAddress.id = clientRequest.shippingAddress.id;
        }
        // shippingAddress.address2 is sometimes, but not always, excluded if empty/null
        if (typeof clientRequest.shippingAddress.address2 == 'undefined'
            && typeof serverRequest.shippingAddress.address2 != 'undefined'
            && common.isNull(serverRequest.shippingAddress.address2)
        ) {
            delete serverRequest.shippingAddress.address2;
        } else if (clientRequest.shippingAddress.address2 != 'undefined'
            && typeof serverRequest.shippingAddress.address2 == 'undefined'
            && common.isNull(clientRequest.shippingAddress.address2)
        ) {
            serverRequest.shippingAddress.address2 = clientRequest.shippingAddress.address2;
        }
        return common.matchObjects(clientRequest, serverRequest);
    } catch (e) {
        Logger.error('[shoppayCheckoutHelpers.js] error: \n\r' + e.message + '\n\r' + e.stack);
    }
    return false;
}

/**
 * Ensures that all shipments have a shipping method assigned.
 * @param {dw.order.LineItemContainer} basket - the target basket
 * @returns {boolean} true if all shipments have a shipping method assigned, otherwise false
 */
function validateShippingMethods(basket) {
    var shipmentsValid = true;

    collections.forEach(basket.shipments, function (shipment) {
        if (shipment.shippingMethod == null) {
            shipmentsValid = false;
            return;
        }
    });
    return shipmentsValid;
}

/**
 * Sets the minimum required billing address data for SFCC order creation from payment request data. This
 * data will be updated with the Shop Pay billing data in the ORDERS_CREATE webhook handler payload after
 * order creation. Billing data is not available in the Shop Pay payment request object.
 * @param {dw.order.Basket} basket - The target basket
 * @param {Object} paymentRequest - The Shop Pay payment request object
 * @param {Object} req - the current request
 */
function handleBillingAddress(basket, paymentRequest, req) {
    Transaction.wrap(function() {
        if (!basket.billingAddress) {
            basket.createBillingAddress();
        }
        if (!basket.customerEmail) {
            // paymentRequest.shippingAddress.email is the email address associated with the Shop Pay customer account
            basket.customerEmail = paymentRequest.shippingAddress.email;
        }
        if (!basket.billingAddress.firstName || !basket.billingAddress.lastName) {
            if (req.currentCustomer.profile) {
                basket.billingAddress.firstName = req.currentCustomer.profile.firstName;
                basket.billingAddress.lastName = req.currentCustomer.profile.lastName;
            } else {
                basket.billingAddress.firstName = paymentRequest.shippingAddress.firstName;
                basket.billingAddress.lastName = paymentRequest.shippingAddress.lastName;
            }
        }
    });
}

/**
 * Extrapolated fail order to a function to allow for handling of any customizations such
   as custom order attributes, real time inventory reservation reversals, etc.
 * @param {dw.order.Order} order - The target order
 */
function failOrder(order) {
    var OrderMgr = require('dw/order/OrderMgr');
    if (order) {
        Transaction.wrap(function () {
            OrderMgr.failOrder(order, true);
        });
    }
}

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
    var ProductMgr = require('dw/catalog/ProductMgr');
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
            var apiProduct = ProductMgr.getProduct(sku);
            var optionModel = apiProduct.optionModel;

            // Set selected product option on product option model
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

            // Add product line item to temporary basket
            var pli = basket.createProductLineItem(apiProduct, optionModel, basket.defaultShipment);
            pli.setQuantityValue(quantity);
        });
    } catch (e) {
        Logger.error('[shoppayCheckoutHelpers.js] error: \n\r' + e.message + '\n\r' + e.stack);
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
    var paymentRequest;
    var result = addProductToTempBasket(product, basket);
    var shippingMethod = ShippingMgr.defaultShippingMethod;

    Transaction.wrap(function () {
        try {
            // Set shipment shipping method
            shippingHelpers.selectShippingMethod(basket.defaultShipment, shippingMethod.ID);

            // Calculate basket
            basketCalculationHelpers.calculateTotals(basket);
            paymentRequest = new PaymentRequestModel(basket);
        } catch (e) {
            Logger.error('[shoppayCheckoutHelpers.js] error: \n\r' + e.message + '\n\r' + e.stack);
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
    ensureNoEmptyShipments: ensureNoEmptyShipments,
    failOrder: failOrder,
    getBuyNowData: getBuyNowData,
    handleBillingAddress: handleBillingAddress,
    validatePaymentRequest: validatePaymentRequest,
    validateShippingMethods: validateShippingMethods
}
