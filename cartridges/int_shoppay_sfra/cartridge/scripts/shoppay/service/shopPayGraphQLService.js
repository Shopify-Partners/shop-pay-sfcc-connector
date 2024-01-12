'use strict';

const serviceName = 'shoppay.api.admin';
const ServiceCredential = require('dw/svc/ServiceCredential');
const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
const Resource = require('dw/web/Resource');
const tokenCache = require('dw/system/CacheMgr').getCache('paypalRestOauthToken');

/** Create service
 * @returns {dw.svc.Service} service instance
 */
const initService = () => {
    return LocalServiceRegistry.createService(serviceName, {
        createRequest: createRequest,
        parseResponse: function(service, param) {
            return JSON.parse(param.text);
        }
    });
}
/** Creates 'createRequest' callback for a service
 * @param  {dw.svc.Service} service service instance
 * @param {Object} requestData Request data
 * @returns {string} request body
 */
const createRequest = (service, data) => {
    var credential = service.configuration.credential;

    const token = getToken(service);

    service.addHeader('Content-Type', 'application/json');
    service.setRequestMethod('POST');
    service.addHeader('X-Shopify-Access-Token', token);

    return requestData.body ? JSON.stringify(requestData.body) : '';
}

module.exports = function() {
    return LocalServiceRegistry.createService(serviceName, {
        createRequest: createRequest,
        parseResponse: function(service, param) {
            return JSON.parse(param.text);
        }
    });
};