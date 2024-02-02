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

    session.addEventListener("discountcodechanged", function(ev) {
        const currentPaymentRequest = session.paymentRequest;
        const selectedDiscountCodes = ev.discountCodes;

        // let requestData = {
        //     csrf_token: getCsrfToken(),
        //     paymentRequest: JSON.stringify(currentPaymentRequest),
        //     selectedDiscountCodes: selectedDiscountCodes
        // };

        // // ------- POTENTIAL AJAX--------
        // let response = $.ajax({
        //     url: window.shoppayClientRefs.urls.DiscountCodeChanged,
        //     method: 'POST',
        //     async: false,
        //     data: requestData
        // }).responseJSON;



        let requestData = {
            // paymentRequest: session.paymentRequest
            selectedDiscountCodes: selectedDiscountCodes
        }
        // ------- POTENTIAL AJAX--------
        let response = $.ajax({
            url: getUrlWithCsrfToken(window.shoppayClientRefs.urls.DiscountCodeChanged),
            method: 'POST',
            async: false,
            data: JSON.stringify(requestData),
            contentType: 'application/json',
        }).responseJSON;

        // const updatedPaymentRequest = window.ShopPay.PaymentRequest.build({
        //     ...currentPaymentRequest,
        //     deliveryMethods: responseJSON.paymentRequest.deliveryMethods
        // });

        // sessionObj.completeSessionRequest({ token, checkoutUrl, sourceIdentifier });
        console.log(response);
        console.log(ev);
    });

    session.addEventListener("deliverymethodchanged", function(ev) {
        console.log('Selected Delivery Method: ', ev.deliveryMethod);
        const currentPaymentRequest = session.paymentRequest;
        const requestData = {
            deliveryMethod: ev.deliveryMethod
        };

        let responseJSON = $.ajax({
            url: getUrlWithCsrfToken(window.shoppayClientRefs.urls.DeliveryMethodChanged),
            method: 'POST',
            async: false,
            data: JSON.stringify(requestData),
            contentType: 'application/json'
        }).responseJSON;

        // Update the payment request based on the delivery method change and update the total accordingly
        const updatedPaymentRequest = window.ShopPay.PaymentRequest.build({
            ...currentPaymentRequest,
            shippingLines: responseJSON.paymentRequest.shippingLines,
            totalShippingPrice: responseJSON.paymentRequest.totalShippingPrice,
            totalTax: responseJSON.paymentRequest.totalTax,
            total: responseJSON.paymentRequest.total
        });

        session.completeDeliveryMethodChange({ updatedPaymentRequest: updatedPaymentRequest });
        console.log('RESPONSE JSON >>>>> ', responseJSON);
        console.log("UPDATED PAYMENT REQUEST >>>>> ", updatedPaymentRequest);
    });

    session.addEventListener("shippingaddresschanged", function(ev) {
        console.log('Shipping Address: ', ev.shippingAddress);
        const currentPaymentRequest = session.paymentRequest;
        const requestData = {
            shippingAddress: ev.shippingAddress,
        };

        let responseJSON = $.ajax({
            url: getUrlWithCsrfToken(window.shoppayClientRefs.urls.ShippingAddressChanged),
            method: 'POST',
            async: false,
            data: JSON.stringify(requestData),
            contentType: 'application/json'
        }).responseJSON;

        // Update the payment request based on the shipping address change
        const updatedPaymentRequest = window.ShopPay.PaymentRequest.build({
            ...currentPaymentRequest,
            deliveryMethods: responseJSON.paymentRequest.deliveryMethods
        });

        session.completeShippingAddressChange({ updatedPaymentRequest: updatedPaymentRequest });
        console.log(updatedPaymentRequest);
    });

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
