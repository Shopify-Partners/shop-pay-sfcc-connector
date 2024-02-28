'use strict';

var ShippingMgr = require('dw/order/ShippingMgr');
var collections = require('*/cartridge/scripts/util/collections');
var common = require('*/cartridge/scripts/shoppay/shoppayCommon');
var eDeliveryHelpers = require('*/cartridge/scripts/shoppay/helpers/eDeliveryHelpers');
var deliveryDateHelpers = require('*/cartridge/scripts/shoppay/helpers/deliveryDateHelpers');

/**
 * Checks the current cart or order for any BOPIS shipments. Note that BOPIS is not currently
 * supported in the Shop Pay checkout modal. More than 1 home delivery shipment is also not supported.
 * @param {dw.order.LineItemCtnr} basket - the current line item container
 * @returns {boolean} - true if the basket contains a shipment type that is not compatible with Shop Pay
 */
function hasIneligibleShipments(basket) {
    /*  Skip the multi-shipping check if Buy Now (temporary basket). Buy Now always creates a new, temporary
        basket with single shipment, single line item only. Buy Now should not be excluded because of what is
        sitting in a shopper's regular (non-Buy Now) cart.
    */
    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket = BasketMgr.getCurrentBasket();
    if (currentBasket && currentBasket.UUID === basket.UUID) {
        var usingMultiShipping = session.privacy.usingMultiShipping === true;
        if (usingMultiShipping && basket.shipments.length < 2) {
            usingMultiShipping = false;
        }
        if (usingMultiShipping) {
            return true;
        }
    }

    var ineligibleShipments = collections.find(basket.shipments, function (shipment) {
        var shippingMethod = shipment.shippingMethod;
        var isBOPISShipment = shippingMethod != null && shippingMethod.custom.storePickupEnabled ? true : false;
        // Ensure BOPIS shipment actually has BOPIS line items
        var BOPISLines = collections.find(shipment.productLineItems, function(pli) {
            return !empty(pli.custom.fromStoreId);
        });
        return (isBOPISShipment === true && shipment.productLineItems.length > 0) || BOPISLines !== null;
    });
    if (ineligibleShipments) {
        return true;
    }
    return false;
}

/**
 * Identifies the primary shipment whose address will be used in the Shop Pay payment request object.
 * This logic has been abstracted to a separate helper function to allow for split shipment customizations
 * involving e-gift cards. Note that BOPIS is not currently supported in the Shop Pay checkout modal.
 * @param {dw.order.LineItemContainer} basket - the current line item container
 * @returns {dw.order.Shipment} a shipment object
 */
function getPrimaryShipment(basket) {
    if (hasIneligibleShipments(basket)) {
        return null;
    }
    var shipments = basket.getShipments();
    // use default shipment if only 1 shipment or if all shipments contain e-delivery items
    var primaryShipment = basket.getDefaultShipment();
    if (shipments.length > 1) {
        var homeDeliveryShipment = collections.find(shipments, function (shipment) {
            var eDeliveryItems = eDeliveryHelpers.getEDeliveryItems(shipment);
            var isEDeliveryShipment = shipment.shippingMethod == null
                ? false
                : eDeliveryHelpers.isEDeliveryShippingMethod(shipment.shippingMethod);
            return !isEDeliveryShipment && eDeliveryItems.length == 0;
        });
        if (homeDeliveryShipment != null) {
            primaryShipment = homeDeliveryShipment;
        }
    }
    return primaryShipment;
}

/**
 * Filters the shipping methods for the current customer's basket for only those supported by the
 * Shop Pay modal. Note that BOPIS is not currently supported in the Shop Pay checkout modal.
 * @param {dw.order.Shipment} shipment - the target shipment
 * @param {Object} [address] - optional address object
 * @returns {dw.util.Collection} an array of filtered dw.order.ShippingMethod objects
 */
function getApplicableShippingMethods(shipment) {
    if (!shipment) {
        return null;
    }

    var shipmentShippingModel = ShippingMgr.getShipmentShippingModel(shipment);
    var shippingMethods = shipmentShippingModel.getApplicableShippingMethods();
    var isEDeliveryApplicable = eDeliveryHelpers.getEDeliveryItems(shipment).length > 0;

    // Filter out whatever the method associated with in store pickup and e-delivery if no digital items
    var ArrayList = require('dw/util/ArrayList');
    var filteredMethods = new ArrayList();
    collections.forEach(shippingMethods, function (shippingMethod) {
        var isEDeliveryMethod = eDeliveryHelpers.isEDeliveryShippingMethod(shippingMethod);
        if (!shippingMethod.custom.storePickupEnabled
            && ((!isEDeliveryApplicable && !isEDeliveryMethod) || (isEDeliveryApplicable && isEDeliveryMethod))
        ) {
            filteredMethods.push(shippingMethod);
        }
    });

    return filteredMethods;
}

/**
 * Generates the shipping address portion of the Shop Pay payment request object from the primary shipment.
 * Note that the payment request object accepts only one shipping address per order.
 * @param {dw.order.Shipment} shipment - the target shipment
 * @param {dw.order.LineItemCtnr} basket - the target basket
 * @returns {Object} the shipping address portion of the Shop Pay payment request object
 */
function getShippingAddress(shipment, basket) {
    if (!shipment || !shipment.shippingAddress) {
        return null;
    }

    var shippingAddress = shipment.shippingAddress;
    var shippingAddressObj = {};
    shippingAddressObj.firstName = shippingAddress.firstName;
    shippingAddressObj.lastName = shippingAddress.lastName;
    shippingAddressObj.phone = shippingAddress.phone;
    shippingAddressObj.email = basket.customerEmail;
    shippingAddressObj.companyName = shippingAddress.companyName || "";
    shippingAddressObj.address1 = shippingAddress.address1;
    if (shippingAddressObj.address2) {
        shippingAddressObj.address2 = shippingAddress.address2;
    }
    shippingAddressObj.city = shippingAddress.city;
    shippingAddressObj.provinceCode = shippingAddress.stateCode;
    shippingAddressObj.postalCode = shippingAddress.postalCode;
    shippingAddressObj.countryCode = shippingAddress.countryCode.value;

    return shippingAddressObj;
}

/**
 * Plain JS object that represents the shipping costs of the primary Shipment, which is the
 * home delivery shipment or the first e-delivery shipment if the basket contains only e-delivery
 * shipments
 * @param {dw.order.LineItemCtnr} primaryShipment - the home delivery shipment or the first
 * e-delivery shipment if the basket contains only e-delivery shipments
 * @returns {Object} raw JSON representing the shipping line items
 */
function getShippingLines(primaryShipment) {
    if (!primaryShipment || !primaryShipment.shippingMethod) {
        return [];
    }

    var shippingMethod = primaryShipment.shippingMethod;
    var shippingLine = {
        "label": shippingMethod.displayName,
        "amount": common.getPriceObject(primaryShipment.getShippingTotalPrice()),
        "code": shippingMethod.ID
    };

    return [shippingLine];
}

/**
 * Plain JS object that represents the applicable shipping methods of the target dw.order.Shipment
 * @param {dw.order.Shipment} shipment - the shipment of interest
 * @returns {Object} raw JSON that represents the applicable shipping methods for the target shipment
 */
function getApplicableDeliveryMethods(shipment) {
    if (!shipment.shippingAddress) {
        return [];
    }

    var deliveryMethods = [];
    // Note: cannot use the base getApplicableShippingMethods function here because the JSON structure
    // that it returns does not include the currencyCode and amount as separate elements
    var applicableShippingMethods = getApplicableShippingMethods(shipment);
    if (applicableShippingMethods.length > 0) {
        collections.forEach(applicableShippingMethods, function (shippingMethod) {
            var method = {
                "label": shippingMethod.displayName,
                "code": shippingMethod.ID,
                "detail": shippingMethod.displayName,
                "deliveryExpectationLabel": null,
                "minDeliveryDate": deliveryDateHelpers.getMinDeliveryDate(shippingMethod),
                "maxDeliveryDate": deliveryDateHelpers.getMaxDeliveryDate(shippingMethod)
            };
            /* Note minDeliveryDate and maxDeliveryDate are required for each delivery method by GraphQL,
               but are not OOTB calculations/attributes in SFCC. Therefore, placeholders are passed to the
               modal, but never used by the modal/seen by the customer. */
            if (shippingMethod.custom.estimatedArrivalTime) {
                method.deliveryExpectationLabel = shippingMethod.custom.estimatedArrivalTime;
            } else if (shippingMethod.description) {
                method.deliveryExpectationLabel = shippingMethod.description;
            }
            var shipmentShippingModel = ShippingMgr.getShipmentShippingModel(shipment);
            var shippingCost = shipmentShippingModel.getShippingCost(shippingMethod);
            method.amount = common.getPriceObject(shippingCost.getAmount());
            deliveryMethods.push(method);
        });
    }

    return deliveryMethods;
}

module.exports = {
    hasIneligibleShipments: hasIneligibleShipments,
    getPrimaryShipment: getPrimaryShipment,
    getShippingAddress: getShippingAddress,
    getShippingLines: getShippingLines,
    getApplicableDeliveryMethods: getApplicableDeliveryMethods
};
