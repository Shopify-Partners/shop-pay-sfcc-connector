// Global Variables
let orderConfirmationData;

/**
 * Add csrf token param to url
 * @param {string} url - source url
 * @param {string} basketId - UUID of the temporary basket in the session, if applicable
 * @returns {string} - url with csrf_token param
 */
function getUrlWithCsrfToken(url, basketId) {
    const urlInstance = new URL(url, location.origin);

    urlInstance.searchParams.append('csrf_token', getCsrfToken());

    
    // ================== ADDING NEW BASKET ID -- FROM POC BRANCH ==================
    if (basketId) {
        urlInstance.searchParams.append('basketId', basketId);
    }
    // =============================================================================

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

function isCartEmptyOnLoad() {
    let $element = document.querySelector('[data-empty-cart-load]');
    if ($element && $element.attributes['data-empty-cart-load'] && $element.attributes['data-empty-cart-load'].value) {
        return $element.attributes['data-empty-cart-load'].value === 'true';
    }
    return false;
}


// =========================== NEW HELPERS FROM SSPSC-38 POC ===========================
function isReadyToOrder() {
    let readyToOrder = false;
    let $element = document.querySelector('[data-ready-to-order]');
    if ($element && $element.attributes['data-ready-to-order'] && $element.attributes['data-ready-to-order'].value) {
        readyToOrder = $element.attributes['data-ready-to-order'].value === "true";
    }
    return readyToOrder;
}

function getInitProductData() {
    let productData = null;
    let $element = document.querySelector('[data-buy-now-init]');
    if ($element && $element.attributes['data-buy-now-init'] && $element.attributes['data-buy-now-init'].value) {
        productData = JSON.parse($element.attributes['data-buy-now-init'].value);
    }
    return productData;
}
// =====================================================================


// Sets Up ShopPay listener Events
function setSessionListeners(session) {
    // TODO: remove this debugging line before final delivery
    console.log('=== APPLYING SESSION LISTENERS ===');

    session.addEventListener("sessionrequested", function (ev) {
        let requestData = {
            paymentRequest: session.paymentRequest
        }

        let response = $.ajax({
            url: getUrlWithCsrfToken(window.shoppayClientRefs.urls.BeginSession),
            method: 'POST',
            async: false,
            data: JSON.stringify(requestData),
            contentType: 'application/json',
        }).responseJSON;

        const { token, checkoutUrl, sourceIdentifier } = response;
        session.completeSessionRequest({ token, checkoutUrl, sourceIdentifier });
        // TODO: remove these debugging lines before final delivery
        console.log('sessionrequested', ev);
        console.log(response);
    });

    session.addEventListener("discountcodechanged", function(ev) {
        const currentPaymentRequest = session.paymentRequest;
        let requestData = {
            discountCodes: ev.discountCodes
        }

        let responseJSON = $.ajax({
            url: getUrlWithCsrfToken(window.shoppayClientRefs.urls.DiscountCodeChanged),
            method: 'POST',
            async: false,
            data: JSON.stringify(requestData),
            contentType: 'application/json',
        }).responseJSON;
        const { deliveryMethods, discountCodes, lineItems, shippingLines, subtotal, discounts, totalShippingPrice, totalTax, total } = responseJSON.paymentRequest;

        let updatedPaymentRequest = window.ShopPay.PaymentRequest.build({
            ...currentPaymentRequest,
            discountCodes: discountCodes,
            lineItems: lineItems,
            shippingLines: shippingLines,
            deliveryMethods: deliveryMethods,
            subtotal: subtotal,
            discounts: discounts,
            totalTax: totalTax,
            total: total
        });
        if (totalShippingPrice) {
            updatedPaymentRequest = window.ShopPay.PaymentRequest.build({
                ...updatedPaymentRequest,
                totalShippingPrice: totalShippingPrice
            });
        }

        session.completeDiscountCodeChange({ updatedPaymentRequest: updatedPaymentRequest });
        // TODO: remove these debugging lines before final delivery
        console.log('discountcodechanged', ev);
        console.log("Updated Payment Req w/ entered Discount Code: ", updatedPaymentRequest);
    });

    session.addEventListener("deliverymethodchanged", function(ev) {
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
        // TODO: remove these debugging lines before final delivery
        console.log('deliverymethodchanged', ev);
        console.log('Selected Delivery Method: ', ev.deliveryMethod);
        console.log("Updated Payment Req w/ entered Delivery Method: ", updatedPaymentRequest);
    });

    session.addEventListener("shippingaddresschanged", function(ev) {
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
        // TODO: remove these debugging lines before final delivery
        console.log('shippingaddresschanged', ev);
        console.log('Shipping Address: ', ev.shippingAddress);
        console.log("Updated Payment Req w/ entered Shipping Address: ", updatedPaymentRequest);
    });

    session.addEventListener("paymentconfirmationrequested", function(ev) {
        // TODO: remove this debugging line before final delivery
        console.log('paymentconfirmationrequested', ev);
        const requestData = {
            token: session.token,
            paymentRequest: session.paymentRequest,
        };

        let responseJSON = $.ajax({
            url: getUrlWithCsrfToken(window.shoppayClientRefs.urls.SubmitPayment),
            method: 'POST',
            async: false,
            data: JSON.stringify(requestData),
            contentType: 'application/json'
        }).responseJSON;

        orderConfirmationData = {
            orderID: responseJSON.orderID,
            orderToken: responseJSON.orderToken,
            continueUrl: responseJSON.continueUrl
        };
        session.completePaymentConfirmationRequest();
    });

    session.addEventListener("paymentcomplete", function(ev) {
        // TODO: remove this debugging line before final delivery
        console.log('paymentcomplete', ev);
        session.close();
        let data = orderConfirmationData;
        let redirect = $('<form>').appendTo(document.body).attr({
            method: 'POST',
            action: data.continueUrl
            });
        $('<input>').appendTo(redirect).attr({
            name: 'orderID',
            value: data.orderID
        });
        $('<input>').appendTo(redirect).attr({
            name: 'orderToken',
            value: data.orderToken
        });
        redirect.submit();
    });
}

export {
    getCsrfToken,
    getUrlWithCsrfToken,
    isCartEmptyOnLoad,
    setSessionListeners,
    getInitProductData,
    isReadyToOrder
};
