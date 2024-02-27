const helper = require('./helpers/abTestHelpers');

$(document).ready(function () {
    if(window.ShopPay) {
        //the return form parseABTestCookie is still a string not a object
        var abCookieJSON = helper.parseABTestCookie();

        if(abCookieJSON && !abCookieJSON['isTracked']) {
            var {subjectId, assignmentGroup} = abCookieJSON;
            // ## JavaScript SDK for A/A and A/B testing
            // Use the `track` method to provide checkout metrics.
            // Send the assignment event
            window.ShopPay.PaymentRequest.track({
                subjectId: subjectId,
                assignmentGroup: assignmentGroup,
                shopId: window.shoppayClientRefs.preferences.shoppayStoreId,
                experimentId: '<experiment-id-from-shopify>', //site pref or custom attribute
                timestamp: new Date().toISOString()
            });

            // Send the checkout events
            window.ShopPay.PaymentRequest.track({
                subjectId: subjectId,
                shopPayToken: null,
                action: 'checkout-begin', // or 'checkout-complete'
                totalPrice: "10000", // The total price of the order in cents
                timestamp: new Date().toISOString()
            });
            abCookieJSON['isTracked'] = true;
            helper.deleteCookieValue('shoppayAB');
            helper.setCookie('shoppayAB', JSON.stringify(abCookieJSON), 90);
        }
    }
});