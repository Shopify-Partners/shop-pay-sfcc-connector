'use strict'

var logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');

/**
 * Function to retrieve the details of a Shop Pay order using the Shopify GraphQL Admin API
 * @param {string} sourceIdentifier - the Shop Pay payment request object representing the customer's basket
 * @returns {Object} The GraphQL service response body
 */
function getOrderBySourceIdentifier(sourceIdentifier) {
    try {
        var queryString = "query {orders(first: 1, query: \"source_identifier:'" + sourceIdentifier + "'\") {edges {node {id name sourceIdentifier email billingAddress {firstName lastName address1 address2 city provinceCode countryCodeV2 phone }}}}}";
        const bodyObj = {
            "query":queryString,
            "variables":{}
        };
        var shoppayAdminService = require('*/cartridge/scripts/shoppay/service/shoppayAdminService')();
        var response = shoppayAdminService.call({
            body: bodyObj || {}
        });

        // Kristin TODO: Remove !response.object.data from third conditional if permissions issue is resolved
        if (!response.ok
            || !response.object
            || !response.object.data
            || (response.object.errors && response.object.errors.length > 0 && !response.object.data)
        ) {
            return {
                error: true,
                errorMsg: response.errorMessage
            }
        }
        return response.object.data;
    } catch (e) {
        logger.error('[adminAPI.js] error: \n\r' + e.message + '\n\r' + e.stack);
        return {
            error: true,
            errorMsg: e.message
        };
    }
}

module.exports = {
    getOrderBySourceIdentifier: getOrderBySourceIdentifier
};
