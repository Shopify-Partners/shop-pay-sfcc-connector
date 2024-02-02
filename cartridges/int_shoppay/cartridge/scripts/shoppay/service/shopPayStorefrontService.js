'use strict';

const serviceName = 'shoppay.api.storefront';
const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
const shopPayServiceHelper = require('*/cartridge/scripts/shoppay/helpers/serviceHelpers');

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
    dw.system.Logger.debug('serviceURL = ' + serviceURL);

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
            return (shopPayServiceHelper.getStorefrontRequestLogMessage(request));
        },
        getResponseLogMessage: function (response) {
            return (shopPayServiceHelper.getStorefrontResponseLogMessage(response));
        },
        mockCall: function (service, params) {
            var data = JSON.parse(params);
            const mockResponse = shopPayServiceHelper.getMockResponse(data.variables.token ? 'sessionSubmit' : 'createSession');
            return {
                statusCode: 200,
                statusMessage: 'success',
                text: JSON.stringify(mockResponse)
            }
        }
    });
};
