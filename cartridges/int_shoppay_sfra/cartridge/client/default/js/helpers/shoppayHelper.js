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
function setSessionListeners(session) {

    console.log('=== APPLYING SESSION LISTENERS ===');
    console.log('SESSION OBJ >>>>> ', session);
    // let productData = {};
    // let sourceIdentifier = null;
    // let token = null;
    // let checkoutUrl = null;

    session.addEventListener("sessionrequested", function (ev) {
        console.log(ev);

        let requestData = {
            paymentRequest: session.paymentRequest
        }
        // let url = getUrlWithCsrfToken(window.shoppayClientRefs.urls.BeginSession);
        // console.log('URL >>>>> ', url);

        // ------- AJAX (CURRENTLY WORKING) --------
        let response = $.ajax({
            url: getUrlWithCsrfToken(window.shoppayClientRefs.urls.BeginSession),
            method: 'POST',
            async: false,
            data: JSON.stringify(requestData),
            contentType: 'application/json',
        }).responseJSON;

        const { token, checkoutUrl, sourceIdentifier } = response;
        session.completeSessionRequest({ token, checkoutUrl, sourceIdentifier });
        console.log(response);

    });

    // sessionObj.addEventListener("discountcodechanged", function(ev) {
    //     const currentPaymentRequest = sessionObj.paymentRequest;
    //     const selectedDiscountCodes = ev.discountCodes;

    //     let requestData = {
    //         csrf_token: getCsrfToken(),
    //         paymentRequest: JSON.stringify(currentPaymentRequest),
    //         selectedDiscountCodes: selectedDiscountCodes
    //     };

    //     // // ------- POTENTIAL AJAX--------
    //     let response = $.ajax({
    //         url: window.shoppayClientRefs.urls.DiscountCodeChanged,
    //         method: 'POST',
    //         async: false,
    //         data: requestData
    //     }).responseJSON;

    //     // const updatedPaymentRequest = window.ShopPay.PaymentRequest.build({
    //     //     ...currentPaymentRequest,
    //     //     deliveryMethods: responseJSON.paymentRequest.deliveryMethods
    //     // });

    //     // sessionObj.completeSessionRequest({ token, checkoutUrl, sourceIdentifier });
    //     console.log(response);
    //     console.log(ev);
    // });

    // sessionObj.addEventListener("deliverymethodchanged", function(ev) {
    //     //console.log(ev);
    //     const currentPaymentRequest = sessionObj.paymentRequest;
    //     const selectedDeliveryMethod = ev.deliveryMethod;
    //     const requestData = {
    //         selectedDeliveryMethod: selectedDeliveryMethod,
    //         paymentRequest: currentPaymentRequest,
    //         basketId: sourceIdentifier
    //     };


    //     console.log(ev);
    //     console.log('REQUEST DATA >>>> ', requestData);


    //     // let responseJSON = $.ajax({
    //     //     url: helper.getUrlWithCsrfToken(window.shoppayClientRefs.urls.DeliveryMethodChanged),
    //     //     method: 'POST',
    //     //     async: false,
    //     //     data: JSON.stringify(requestData),
    //     //     contentType: 'application/json'
    //     // }).responseJSON;

    //     // // Update the payment request based on the delivery method change
    //     // // and update the total accordingly
    //     // const updatedPaymentRequest = window.ShopPay.PaymentRequest.build({
    //     //     ...currentPaymentRequest,
    //     //     shippingLines: responseJSON.paymentRequest.shippingLines,
    //     //     totalShippingPrice: responseJSON.paymentRequest.totalShippingPrice,
    //     //     totalTax: responseJSON.paymentRequest.totalTax,
    //     //     total: responseJSON.paymentRequest.total
    //     // });

    //     // sessionObj.completeDeliveryMethodChange({ updatedPaymentRequest: updatedPaymentRequest });
    // });

    // sessionObj.addEventListener("shippingaddresschanged", function(ev) {
    //     //console.log(ev);
    //     const currentPaymentRequest = sessionObj.paymentRequest;
    //     const selectedAddress = ev.shippingAddress;
    //     const requestData = {
    //         selectedAddress: selectedAddress,
    //         paymentRequest: currentPaymentRequest,
    //         basketId: sourceIdentifier
    //     };

    //     let responseJSON = $.ajax({
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

    // sessionObj.addEventListener("paymentconfirmationrequested", function(ev) {
    //     console.log(ev);
    //     const requestData = {
    //         paymentRequest: sessionObj.paymentRequest,
    //         token: token
    //     };
    //     let responseJSON = $.ajax({
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

    // // sessionObj.addEventListener("paymentcomplete", function(ev) {
    //     console.log(ev);
    //     sessionObj.close();
    //     let data = orderConfirmationData;
    //     let redirect = $('<form>').appendTo(document.body).attr({
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
    setSessionListeners
};
