'use strict';

var collections = require('*/cartridge/scripts/util/collections');

function hasIneligibleShipments(basket) {
    var hasIneligibleShipments = false;
    var ineligibleShipments = collections.find(basket.shipments, function (shipment) {
        var shippingMethod = shipment.shippingMethod;
        var isBOPIS = shippingMethod != null && shippingMethod.custom.storePickupEnabled ? true : false;
        return isBOPIS === true;
    })
    if (ineligibleShipments) {
        hasIneligibleShipments = true;
    }
    return hasIneligibleShipments;
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
 * Kristin TODO: complete JS docs and flesh out applicable shipments logic
 * @param {*} basket
 */
function getApplicableShipments(basket) {
    var basketShipments = basket.shipments;
    var applicableShipments = [];

    return applicableShipments;
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
 *
 * @param {dw.order.LineItemCtnr} basket - The current basket
 * @returns {Object}
 */
function getShippingLines(basket) {
    var shippingLines = [];
    var shipments = basket.getShipments();
    var applicableShippingLines = [];

    return shippingLines;
}

function getApplicableDeliveryMethods() {
    return [];
}

module.exports = {
    hasIneligibleShipments: hasIneligibleShipments,
    getPrimaryShipment: getPrimaryShipment,
    getShippingAddress: getShippingAddress,
    getShippingLines: getShippingLines,
    getApplicableDeliveryMethods: getApplicableDeliveryMethods
};
