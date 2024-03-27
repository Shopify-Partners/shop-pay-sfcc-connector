'use strict'

/**
 * Helper function to identify whether a product line item is a digital product that does not require physical
 * shipment. This function should be overridden to account for related customizations as digital products do
 * not have out of the box identifiers in SFCC.
 * @param {dw.order.ProductLineItem} pli - the product line item of interest
 * @returns {boolean} true if the product line item represents a digital product, otherwise false
 */
function isEDeliveryItem(pli) {
    return false;
}

/**
 * Helper function to identify the digital products in a shipment that do not require physical
 * shipment. This function should be overridden to account for related customizations as line items, aside from
 * gift certificate line items, do not have out of the box e-delivery identifiers in SFCC.
 * @param {dw.order.Shipment} shipment - the shipment of interest
 * @returns {dw.util.Collection} a collection of any e-delivery line items in the shipment
 */
function getEDeliveryItems(shipment) {
    return shipment.getGiftCertificateLineItems();
}

/**
 * Helper function to identify whether a shipping method is a e-delivery (digital) shipping method used for
 * digital products. This function should be overridden to account for related customizations as shipping methods
 * do not have out of the box e-delivery identifiers in SFCC.
 * @param {dw.order.ShippingMethod} shippingMethod - the shipping method of interest
 * @returns {boolean} true if the shipping method represents e-delivery
 */
function isEDeliveryShippingMethod(shippingMethod) {
    return false;
}

module.exports = {
    getEDeliveryItems: getEDeliveryItems,
    isEDeliveryItem: isEDeliveryItem,
    isEDeliveryShippingMethod: isEDeliveryShippingMethod
};
