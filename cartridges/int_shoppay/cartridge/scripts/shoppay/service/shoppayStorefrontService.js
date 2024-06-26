'use strict';

/* Script Modules */
const shoppayServiceHelper = require('*/cartridge/scripts/shoppay/helpers/serviceHelpers');

/* API Includes */
const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

/* Global Variables */
const serviceName = 'shoppay.api.storefront';

/** Creates 'createRequest' callback for a service
 * @param  {dw.svc.Service} service service instance
 * @param {Object} data Request data
 * @returns {string} request body
 */
function createRequest(service, data) {
    const Site = require('dw/system/Site').current;
    const storeName = Site.getCustomPreferenceValue('shoppayStoreName');
    const version = Site.getCustomPreferenceValue('shoppayStorefrontAPIVersion');
    const token = Site.getCustomPreferenceValue('shoppayStorefrontAPIToken');

    const credential = service.configuration.credential;
    var serviceURL = credential.getURL();
    serviceURL = serviceURL.replace('{store_name}', storeName);
    serviceURL = serviceURL.replace('{storefront_api_version}', version);

    service.addHeader('Content-Type', 'application/json');
    service.setRequestMethod('POST');
    service.addHeader('X-Shopify-Storefront-Access-Token', token);
    service.setURL(serviceURL);

    return data.body ? JSON.stringify(data.body) : '';
}

module.exports = function () {
    return LocalServiceRegistry.createService(serviceName, {
        createRequest: createRequest,
        parseResponse: function (service, response) {
            return JSON.parse(response.text);
        },
        getRequestLogMessage: function (request) {
            return (shoppayServiceHelper.getStorefrontRequestLogMessage(request));
        },
        getResponseLogMessage: function (response) {
            return (shoppayServiceHelper.getStorefrontResponseLogMessage(response));
        },
        mockCall: function (service, params) {
            var data = JSON.parse(params);
            const mockResponse = shoppayServiceHelper.getMockResponse(data.variables.token ? 'sessionSubmit' : 'createSession');
            return {
                statusCode: 200,
                statusMessage: 'success',
                text: JSON.stringify(mockResponse)
            }
        }
    });
};
