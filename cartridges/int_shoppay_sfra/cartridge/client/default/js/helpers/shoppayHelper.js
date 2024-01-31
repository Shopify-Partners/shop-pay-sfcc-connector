/**
 * Add csrf token param to url
 * @param {string} url - source url
 * @returns {string} - url with csrf_token param
 */
function getUrlWithCsrfToken(url) {
    const urlInstance = new URL(url, location.origin);

    urlInstance.searchParams.append('csrf_token', getCsrfToken());

    return urlInstance.toString();
}

/**
 * Get CSRF Token
 * @returns {string} - csrf token value
 */
function getCsrfToken() {
    let $element = document.querySelector('[data-csrf-token]');

    if ($element && $element.attributes['data-csrf-token'] && $element.attributes['data-csrf-token'].value) {
        return $element.attributes['data-csrf-token'].value;
    }

    return '';
}

// Sets Up ShopPay listener Events
function setShopPaySessionListeners(sessionObj) {

    console.log('SESSION LISTENERS!!');
    console.log('SESSION OBJ >>>>> ', sessionObj);
    let productData = {};



    sessionObj.addEventListener("sessionrequested", function (ev) {
        console.log(ev);
        let paymentRequest;
        if (window.shoppayClientRefs.constants.isBuyNow) {
            $.ajax({
                url: getUrlWithCsrfToken(window.shoppayClientRefs.urls.PrepareBasket),
                method: 'POST',
                async: false,
                data: JSON.stringify(productData),
                contentType: 'application/json',
                success: function (data) {
                    if (!data.error) {
                        paymentRequest = data.paymentRequest;
                        sourceIdentifier = data.basketId;
                    } else {
                        console.log(data.errorMsg);
                    }
                },
                error: function () {
                    // TODO
                }
            });
        } else {
            paymentRequest = sessionObj.paymentRequest
        }
        // TODO: only passing basketId for temp baskets right now.... try to add to all for robustness
        var requestData = {
            paymentRequest: paymentRequest,
            basketId: sourceIdentifier
        };

        $.ajax({
            url: getUrlWithCsrfToken(window.shoppayClientRefs.urls.BeginSession),
            method: 'POST',
            async: false,
            data: JSON.stringify(requestData),
            contentType: 'application/json',
            success: function (data) {
                token = data.token;
                checkoutUrl = data.checkoutUrl;
                sourceIdentifier = data.sourceIdentifier;
                sessionObj.completeSessionRequest({token, checkoutUrl, sourceIdentifier});
            },
            error: function (err) {
                console.log(err);
            }

        });
    });

    sessionObj.addEventListener("discountcodechanged", function(ev) {
        console.log(ev);
    });

    // sessionObj.addEventListener("shippingaddresschanged", function(ev) {
    //     //console.log(ev);
    //     const currentPaymentRequest = session.paymentRequest;
    //     const selectedAddress = ev.shippingAddress;
    //     var requestData = {
    //         selectedAddress: selectedAddress,
    //         paymentRequest: currentPaymentRequest,
    //         basketId: sourceIdentifier
    //     };

    //     var responseJSON = $.ajax({
    //         url: getUrlWithCsrfToken(window.shoppayClientRefs.urls.ShippingAddressChanged),
    //         method: 'POST',
    //         async: false,
    //         data: JSON.stringify(requestData),
    //         contentType: 'application/json'
    //     }).responseJSON;

    //     // Update the payment request based on the shipping address change
    //     const updatedPaymentRequest = window.ShopPay.PaymentRequest.build({
    //         ...currentPaymentRequest,
    //         deliveryMethods: responseJSON.paymentRequest.deliveryMethods
    //     });

    //     sessionObj.completeShippingAddressChange({ updatedPaymentRequest: updatedPaymentRequest });
    //     console.log(updatedPaymentRequest);
    // });

    // sessionObj.addEventListener("deliverymethodchanged", function(ev) {
    //     //console.log(ev);
    //     const currentPaymentRequest = sessionObj.paymentRequest;
    //     const selectedDeliveryMethod = ev.deliveryMethod;
    //     var requestData = {
    //         selectedDeliveryMethod: selectedDeliveryMethod,
    //         paymentRequest: currentPaymentRequest,
    //         basketId: sourceIdentifier
    //     };

    //     var responseJSON = $.ajax({
    //         url: helper.getUrlWithCsrfToken(window.shoppayClientRefs.urls.DeliveryMethodChanged),
    //         method: 'POST',
    //         async: false,
    //         data: JSON.stringify(requestData),
    //         contentType: 'application/json'
    //     }).responseJSON;

    //     // Update the payment request based on the delivery method change
    //     // and update the total accordingly
    //     const updatedPaymentRequest = window.ShopPay.PaymentRequest.build({
    //         ...currentPaymentRequest,
    //         shippingLines: responseJSON.paymentRequest.shippingLines,
    //         totalShippingPrice: responseJSON.paymentRequest.totalShippingPrice,
    //         totalTax: responseJSON.paymentRequest.totalTax,
    //         total: responseJSON.paymentRequest.total
    //     });

    //     sessionObj.completeDeliveryMethodChange({ updatedPaymentRequest: updatedPaymentRequest });
    // });

    // sessionObj.addEventListener("paymentconfirmationrequested", function(ev) {
    //     console.log(ev);
    //     var requestData = {
    //         paymentRequest: sessionObj.paymentRequest,
    //         token: token
    //     };
    //     var responseJSON = $.ajax({
    //         url: getUrlWithCsrfToken(window.shoppayClientRefs.urls.SubmitPayment),
    //         method: 'POST',
    //         async: false,
    //         data: JSON.stringify(requestData),
    //         contentType: 'application/json'
    //     }).responseJSON;
    //     orderConfirmationData = {
    //         orderID: responseJSON.orderID,
    //         orderToken: responseJSON.orderToken,
    //         continueUrl: responseJSON.continueUrl
    //     };
    //     sessionObj.completePaymentConfirmationRequest();
    // });

    // sessionObj.addEventListener("paymentcomplete", function(ev) {
    //     console.log(ev);
    //     sessionObj.close();
    //     var data = orderConfirmationData;
    //     var redirect = $('<form>').appendTo(document.body).attr({
    //         method: 'POST',
    //         action: data.continueUrl
    //         });
    //     $('<input>').appendTo(redirect).attr({
    //         name: 'orderID',
    //         value: data.orderID
    //     });
    //     $('<input>').appendTo(redirect).attr({
    //         name: 'orderToken',
    //         value: data.orderToken
    //     });
    //     redirect.submit();
    // });

}

export {
    getCsrfToken,
    getUrlWithCsrfToken,
    setShopPaySessionListeners
};
