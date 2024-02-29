const helper = require('./helpers/abTestHelpers');

$(document).ready(function () {
    if(window.ShopPay) {
        //the return form parseABTestCookie is still a string not a object
        const abCookieJSON = helper.parseABTestCookie();

        if(abCookieJSON && abCookieJSON.isStarted) {
            //If you have modified SFRA checkout classes please verify the correct price is pulled
            const totalPrice = $('.order-total-summary .grand-total-sum').text().replace(/\$|\./gm, '');
            const trackObject = {
                subjectId: subjectId,
                shopPayToken: abCookieJSON['st'] || null,
                action: 'checkout-begin',
                totalPrice: totalPrice, // The total price of the order in cents
                timestamp: new Date().toISOString()
            };
            console.log('test', trackObject);
            // Send the checkout events
            window.ShopPay.PaymentRequest.track(trackObject);
            delete abCookieJSON.isStarted;

            helper.deleteCookieValue('shoppayAB');
            //btoa encodes the string to base64 to ensure the cookie JSON string keeps
            // the correct struture
            helper.setCookie('shoppayAB', btoa(JSON.stringify(abCookieJSON)), 90);
        }
    }
});