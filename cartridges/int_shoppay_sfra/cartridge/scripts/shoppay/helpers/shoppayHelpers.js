/**
 * Returns the shipping method in the array with the given ID, or null if not found.
 * @param {Array} shippingMethods - The array of shipping methods in which to search
 * @param {string} id - The ID of the shipping method to find
 * @return {dw.order.ShippingMethod} The shipping method found with that ID
 */
function findShippingMethod(shippingMethods, id) {
    for (var i = 0; i < shippingMethods.length; i++) {
        if (id === shippingMethods[i].ID) {
            return shippingMethods[i];
        }
    }
    return null;
}

module.exports = {
    findShippingMethod: findShippingMethod
};