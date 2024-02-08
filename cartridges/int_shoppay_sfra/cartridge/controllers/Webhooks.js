'use strict';

/**
 * @namespace Webhooks
 */

var server = require('server');

var URLUtils = require('dw/web/URLUtils');

var adminAPI = require('*/cartridge/scripts/shoppay/adminAPI');
var logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');

server.post('OrdersCreate', server.middleware.https, function (req, res, next) {
    try {
        logger.debug(req.body);
    } catch (e) {
        logger.error('[Webhooks-OrdersCreate] error: \n\r' + e.message + '\n\r' + e.stack);
    }
    res.json({
        success: true
    });
    next();
});

server.get('Subscribe', server.middleware.https, function (req, res, next) {
    var response;
    try {
        var callbackUrl = URLUtils.https('Webhooks-OrdersCreate').toString();
        //var callbackUrl = 'https://webhook.site/9ae0c822-d2f9-46ed-9f91-7c38e714401d';
        response = adminAPI.subscribeWebhook('ORDERS_CREATE', callbackUrl);
    } catch (e) {
        logger.error('[Webhooks-Subscribe] error: \n\r' + e.message + '\n\r' + e.stack);
        res.json({
            success: false,
            errorMsg: e.message,
            stack: e.stack
        });
        return next();
    }
    res.json({
        success: true,
        response: response
    });
    next();
});

server.get('Unsubscribe', server.middleware.https, function (req, res, next) {
    var response;

    try {
        var id = req.httpParameterMap['id'];
        // "gid://shopify/WebhookSubscription/1464039407936";
        response = adminAPI.unsubscribeWebhook('gid://shopify/WebhookSubscription/' + id);
    } catch (e) {
        logger.error('[Webhooks-Unsubscribe] error: \n\r' + e.message + '\n\r' + e.stack);
        res.json({
            success: false,
            errorMsg: e.message,
            stack: e.stack
        });
        return next();
    }
    res.json({
        success: true,
        response: response
    });
    next();
});

module.exports = server.exports();
