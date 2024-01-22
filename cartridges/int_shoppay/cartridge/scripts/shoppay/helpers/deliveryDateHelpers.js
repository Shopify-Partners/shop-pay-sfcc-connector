'use strict'

var Calendar = require('dw/util/Calendar');
var StringUtils = require('dw/util/StringUtils');

const dateFormat = "yyyy-MM-dd";

/**
 * Helper function to retrieve the minimum expected delivery date for a shipping method for the current
 * basket. This function should be overridden to account for related customizations as SFCC does not
 * supported delivery date ranges OOTB.
 * @param {dw.order.ShippingMethod} shippingMethod - the target shipping method for the basket
 * @returns {string} the minimum delivery date as an ISO 8601-encoded string
 */
function getMinDeliveryDate(shippingMethod) {
    var minDeliveryCalendar = new Calendar();
    minDeliveryCalendar.add(Calendar.DAY_OF_MONTH, 1);
    return StringUtils.formatCalendar(minDeliveryCalendar, dateFormat);
}

/**
 * Helper function to retrieve the maximum expected delivery date for a shipping method for the current
 * basket. This function should be overridden to account for related customizations as SFCC does not
 * supported delivery date ranges OOTB.
 * @param {dw.order.ShippingMethod} shippingMethod - the target shipping method for the basket
 * @returns {string} the minimum delivery date as an ISO 8601-encoded string
 */
function getMaxDeliveryDate(shippingMethod) {
    var maxDeliveryCalendar = new Calendar();
    maxDeliveryCalendar.add(Calendar.DAY_OF_MONTH, 7);
    return StringUtils.formatCalendar(maxDeliveryCalendar, dateFormat);
}

module.exports = {
    getMinDeliveryDate: getMinDeliveryDate,
    getMaxDeliveryDate: getMaxDeliveryDate
}
