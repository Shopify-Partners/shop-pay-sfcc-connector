'use strict';

var ShippingMgr = require('dw/order/ShippingMgr');
var collections = require('*/cartridge/scripts/util/collections');
var util = require('*/cartridge/scripts/util');

/**
 * Checks the current cart or order for any BOPIS shipments. Note that BOPIS is not currently
 * supported in the Shop Pay checkout modal.
 * @param {dw.order.LineItemCtnr} basket - The current basket
 * @returns {boolean} - true if the basket contains a shipment type that is not compatible with Shop Pay
 */
function hasIneligibleShipments(basket) {
    var ineligibleShipments = collections.find(basket.shipments, function (shipment) {
        var shippingMethod = shipment.shippingMethod;
        var isBOPIS = shippingMethod != null && shippingMethod.custom.storePickupEnabled ? true : false;
        // Kristin TODO: Any special handling for EGC? Multiple home delivery shipments?
        return isBOPIS === true;
    })
    if (ineligibleShipments) {
        return true;
    }
    return false;
}

/**
 * Identifies the primary shipment whose address will be used in the Shop Pay payment request object.
 * This logic has been abstracted to a separate helper function to allow for split shipment customizations
 * involving e-gift cards. Note that BOPIS is not currently supported in the Shop Pay checkout modal.
 * @param {dw.order.LineItemContainer} basket - The current basket
 * @returns {dw.order.Shipment} a Shipment object
 */
function getPrimaryShipment(basket) {
    // Kristin TODO: Any special handling for EGC? Return null if any BOPIS shipments?
    return basket.getDefaultShipment();
}

/**
 * Filters the shipping methods for the current customer's basket for only those supported by the
 * Shop Pay modal. Note that BOPIS is not currently supported in the Shop Pay checkout modal.
 * @param {dw.order.Shipment} shipment - the target Shipment
 * @param {Object} [address] - optional address object
 * @returns {dw.util.Collection} an array of filtered dw.order.ShippingMethod objects
 */
function getApplicableShippingMethods(shipment) {
    if (!shipment) return null;

    var shipmentShippingModel = ShippingMgr.getShipmentShippingModel(shipment);
    var shippingMethods = shipmentShippingModel.getApplicableShippingMethods();

    // Filter out whatever the method associated with in store pickup
    var ArrayList = require('dw/util/ArrayList');
    var filteredMethods = new ArrayList();
    collections.forEach(shippingMethods, function (shippingMethod) {
        if (!shippingMethod.custom.storePickupEnabled) {
            filteredMethods.push(shippingMethod);
        }
    });

    // Kristin TODO: Any special handling for e-delivery shipping method?

    return filteredMethods;
}

/**
 * Generates the shipping address portion of the Shop Pay payment request object from the primary shipment.
 * Note that the payment request object accepts only one shipping address per order.
 * @param {dw.order.Shipment} shipment - The target shipment
 * @returns {Object} The shipping address portion of the Shop Pay payment request object
 */
function getShippingAddress(shipment) {
    if (!shipment || !shipment.shippingAddress) {
        return null;
    }

    var shippingAddress = shipment.shippingAddress;
    var shippingAddressObj = {};
    shippingAddressObj.firstName = shippingAddress.firstName;
    shippingAddressObj.lastName = shippingAddress.lastName;
    shippingAddressObj.email = null; // Kristin TODO: get this from the basket?
    shippingAddressObj.phone = shippingAddress.phone;
    shippingAddressObj.companyName = shippingAddress.companyName;
    shippingAddressObj.address1 = shippingAddress.address1;
    shippingAddressObj.address2 = shippingAddress.address2;
    shippingAddressObj.city = shippingAddress.city;
    shippingAddressObj.provinceCode = shippingAddress.stateCode;
    shippingAddressObj.postalCode = shippingAddress.postalCode;
    shippingAddressObj.countryCode = shippingAddress.countryCode.value;

    return shippingAddressObj;
}

/**
 * Plain JS object that represents the shipping line items of the dw.order.LineItemCtnr
 * @param {dw.order.LineItemCtnr} basket - The current basket
 * @returns {Object} raw JSON representing the shipping line items
 */
function getShippingLines(basket) {
    if (hasIneligibleShipments(basket)) {
        return [];
    }

    // Kristin TODO: Any special handling for e-delivery shipment exclusion in mixed cart?

    var defaultShipment = basket.getDefaultShipment();
    if (!basket.defaultShipment.shippingMethod) {
        return [];
    }
    var shippingMethod = basket.defaultShipment.shippingMethod;
    var shippingLine = {
        "label": shippingMethod.displayName,
        "amount": util.getPriceObject(basket.defaultShipment.getShippingTotalPrice()),
        "code": shippingMethod.ID
    };

    return [shippingLine];
}

/**
 * Plain JS object that represents the applicable shipping methods of the target dw.order.Shipment
 * @param {dw.order.Shipment} shipment - The shipment of interest
 * @param {Object} address - Plain JS object that represents the shipping address (optional)
 * @returns {Object} Plain JS object that represents the applicable shipping methods for the target shipment
 */
function getApplicableDeliveryMethods(shipment, address) {
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
                "deliveryExpectation": null
            };
            if (shippingMethod.custom.estimatedArrivalTime) {
                method.deliveryExpectation = shippingMethod.custom.estimatedArrivalTime;
            } else if (shippingMethod.description) {
                method.deliveryExpectation = shippingMethod.description;
            }
            var shipmentShippingModel = ShippingMgr.getShipmentShippingModel(shipment);
            var shippingCost = shipmentShippingModel.getShippingCost(shippingMethod);
            method.amount = util.getPriceObject(shippingCost.getAmount());
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
