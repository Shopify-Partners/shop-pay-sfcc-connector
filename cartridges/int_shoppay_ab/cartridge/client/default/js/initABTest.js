const helper = require('./helpers/abTestHelpers');

$(document).ready(function () {
    if(window.ShopPay) {
        //the return form parseABTestCookie is still a string not a object
        const abCookieJSON = helper.parseABTestCookie();

        if(abCookieJSON && (!abCookieJSON.isAssigned || !abCookieJSON.isStarted)) {
            const { subjectId, assignmentGroup } = abCookieJSON;

            if(!abCookieJSON.isAssigned) {
                var trackObject = {
                    subjectId: subjectId,
                    assignmentGroup: assignmentGroup,
                    shopId: window.shoppayClientRefs.preferences.shoppayStoreId,
                    experimentId: window.shoppayClientRefs.constants.shoppayExperimentId,
                    timestamp: new Date().toISOString()
                };
                // Send the assignment event
                window.ShopPay.PaymentRequest.track(trackObject);
                console.log('SHOPPAY TRACKING EVENT:', trackObject);
                abCookieJSON['isAssigned'] = true;
            }

            if(!abCookieJSON.isStarted) {
                //If you have modified SFRA checkout classes please verify the correct price is pulled
                const totalPrice = $('.order-total-summary .grand-total-sum').text().replace(/\$|\./gm, '');
                var trackObject = {
                    subjectId: subjectId,
                    shopPayToken: null,
                    action: 'checkout-begin',
                    totalPrice: totalPrice, // The total price of the order in cents
                    timestamp: new Date().toISOString()
                };
                // Send the checkout events
                window.ShopPay.PaymentRequest.track(trackObject);
                console.log('SHOPPAY TRACKING EVENT:', trackObject);
                abCookieJSON['isStarted'] = true;
            }

            /*  btoa encodes the string to base64 to ensure the cookie JSON string keeps
                the correct structure
            */
            helper.setCookie('shoppayAB', btoa(JSON.stringify(abCookieJSON), 90));
        }
    }
});