'use strict';

/* Script Modules */
const shoppayServiceHelper = require('*/cartridge/scripts/shoppay/helpers/serviceHelpers');

/* API Includes */
const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

/* Global Variables */
const serviceName = 'shoppay.api.admin';

/** Creates 'createRequest' callback for a service
 * @param  {dw.svc.Service} service service instance
 * @param {Object} data Request data
 * @returns {string} request body
 */
function createRequest(service, data) {
    const Site = require('dw/system/Site').current;
    const storeName = Site.getCustomPreferenceValue('shoppayStoreName');
    const version = Site.getCustomPreferenceValue('shoppayAdminAPIVersion');
    const token = Site.getCustomPreferenceValue('shoppayAdminAPIToken');

    const credential = service.configuration.credential;
    var serviceURL = credential.getURL();
    serviceURL = serviceURL.replace('{store_name}', storeName);
    serviceURL = serviceURL.replace('{admin_api_version}', version);
    dw.system.Logger.debug('serviceURL = ' + serviceURL);

    service.addHeader('Content-Type', 'application/json');
    service.setRequestMethod('POST');
    service.addHeader('X-Shopify-Access-Token', token);
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
            return (shoppayServiceHelper.getAdminRequestLogMessage(request));
        },
        getResponseLogMessage: function (response) {
            return (shoppayServiceHelper.getAdminResponseLogMessage(response));
        },
        mockCall: function (service, params) {
            var query = JSON.parse(params).query;
            var mockResponse = {};
            if (query.indexOf('source_identifier') > 0) {
                mockResponse = shoppayServiceHelper.getMockResponse('orderDetails');
            }
            /* No mock response provided for webhook subscribe/unsubscribe to avoid storing mock data
               in custom objects, which could cause confusion in managing live webhook subscriptions */
            return {
                statusCode: 200,
                statusMessage: 'success',
                text: JSON.stringify(mockResponse)
            }
        }
    });
};
