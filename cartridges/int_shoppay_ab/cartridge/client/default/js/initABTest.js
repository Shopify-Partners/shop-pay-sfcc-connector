const helper = require('./helpers/abTestHelpers');

$(document).ready(function () {
    if(window.ShopPay) {
        //the return form parseABTestCookie is still a string not a object
        const abCookieJSON = helper.parseABTestCookie();

        if(abCookieJSON && (!abCookieJSON.isAssigned || !abCookieJSON.isStarted)) {
            const {subjectId, assignmentGroup} = abCookieJSON;

            if(!abCookieJSON.isAssigned) {
                // Send the assignment event
                window.ShopPay.PaymentRequest.track({
                    subjectId: subjectId,
                    assignmentGroup: assignmentGroup,
                    shopId: window.shoppayClientRefs.preferences.shoppayStoreId,
                    experimentId: window.shoppayClientRefs.preferences.experimentId,
                    timestamp: new Date().toISOString()
                });
                abCookieJSON['isAssigned'] = true;
            }

            if(!abCookieJSON.isStarted) {
                //If you have modified SFRA checkout classes please verify the correct price is pulled
                const totalPrice = $('.order-total-summary .grand-total-sum').text().replace(/\$|\./gm, '');
                // Send the checkout events
                window.ShopPay.PaymentRequest.track({
                    subjectId: subjectId,
                    shopPayToken: null,
                    action: 'checkout-begin',
                    totalPrice: totalPrice, // The total price of the order in cents
                    timestamp: new Date().toISOString()
                });
                abCookieJSON['isStarted'] = true;
            }

            //btoa encodes the string to base64 to ensure the cookie JSON string keeps
            // the correct struture
            helper.setCookie('shoppayAB', btoa(JSON.stringify(abCookieJSON), 90));
        }
    }
});