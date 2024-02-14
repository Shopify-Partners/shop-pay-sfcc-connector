const shopPayCart = require('../cart/initShopPayCart');

// Global Variables
let orderConfirmationData;

// =========================== NEW GLOBAL VARS FROM POC BRANCH ===========================
var sourceIdentifier = null;
var token = null;
var checkoutUrl = null;
var productData = {};
let selectedProduct;
var buyNowResponse = null;
// =======================================================================================

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


function isReadyToOrderOnPageLoad() {
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


function setInitProductData(data) {
    productData = data;
}


// Sets Up ShopPay listener Events
function setSessionListeners(session) {
    // TODO: remove this debugging line before final delivery
    console.log('=== APPLYING SESSION LISTENERS ===');

    session.addEventListener("sessionrequested", function (ev) {
        let sessionPaymentRequest
        
        // ====================================================================================
        // ========== FROM ORIGINAL DEVELOP BRANCH (was full sessionrequested logic) ==========
        // let requestData = {
        //     paymentRequest: session.paymentRequest
        // }

        // let response = $.ajax({
        //     url: getUrlWithCsrfToken(window.shoppayClientRefs.urls.BeginSession),
        //     method: 'POST',
        //     async: false,
        //     data: JSON.stringify(requestData),
        //     contentType: 'application/json',
        // }).responseJSON;

        // const { token, checkoutUrl, sourceIdentifier } = response;
        // session.completeSessionRequest({ token, checkoutUrl, sourceIdentifier });
        // // TODO: remove these debugging lines before final delivery
        // console.log('sessionrequested', ev);
        // console.log(response);
        // ====================================================================================
        // ====================================================================================


        // =========================== FROM POC BRANCH ===========================
        if (window.shoppayClientRefs.constants.isBuyNow) {
            let paymentRequest;
            let paymentRequestResponse;

            // ======== COMMENTED OUT ELSE BLOCK BELOW (pasted from initShipPayCart.js) ????? ========
            // else {
            //     paymentRequestResponse = $.ajax({
            //         url: helper.getUrlWithCsrfToken(window.shoppayClientRefs.urls.GetCartSummary),
            //         type: 'GET',
            //         contentType: 'application/json',
            //         async: false
            //     }) || {};
            //     paymentRequest = paymentRequestResponse.responseJSON.paymentRequest;
            // }
            // =======================================================================================
            // =======================================================================================

            $.ajax({
                url: getUrlWithCsrfToken(window.shoppayClientRefs.urls.PrepareBasket),
                method: 'POST',
                async: false,
                data: JSON.stringify(productData),
                contentType: 'application/json',
                success: function (data) {
                    if (!data.error) {
                        sessionPaymentRequest = data.paymentRequest;
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
            sessionPaymentRequest = session.paymentRequest
        }

         // TODO: only passing basketId for temp baskets right now.... try to add to all for robustness
         var requestData = {
            paymentRequest: sessionPaymentRequest,
            basketId: sourceIdentifier
        };
        // ====================================================================================

        $.ajax({
            url: getUrlWithCsrfToken(window.shoppayClientRefs.urls.BeginSession),
            method: 'POST',
            async: false,
            data: JSON.stringify(requestData),
            contentType: 'application/json',
            success: function (data) {
                console.log("DATA (to send in completeSessionRequest) >>>> ", data);
                token = data.token;
                checkoutUrl = data.checkoutUrl;
                sourceIdentifier = data.sourceIdentifier;
                session.completeSessionRequest({token, checkoutUrl, sourceIdentifier});
            },
            error: function (err) {
                console.log(err);
            }

        });
    });

    session.addEventListener("discountcodechanged", function(ev) {
        const currentPaymentRequest = session.paymentRequest;
        let requestData = {
            discountCodes: ev.discountCodes
        }

        let responseJSON = shopPayCart.createResponse(requestData, window.shoppayClientRefs.urls.DiscountCodeChanged);
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
            deliveryMethod: ev.deliveryMethod,
            // ======= FROM POC....CHECK IF THESE ARE NEEDED IN CONTROLLER CALL ???? =======
            paymentRequest: currentPaymentRequest,
            basketId: sourceIdentifier
            // =============================================================================
        };

        let responseJSON = shopPayCart.createResponse(requestData, window.shoppayClientRefs.urls.DeliveryMethodChanged);
        const { shippingLines, totalShippingPrice, totalTax, total } = responseJSON.paymentRequest;

        // Update the payment request based on the delivery method change and update the total accordingly
        const updatedPaymentRequest = window.ShopPay.PaymentRequest.build({
            ...currentPaymentRequest,
            shippingLines: shippingLines,
            totalShippingPrice: totalShippingPrice,
            totalTax: totalTax,
            total: total
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
            // ======= FROM POC....CHECK IF THESE ARE NEEDED IN CONTROLLER CALL ???? =======
            paymentRequest: currentPaymentRequest,
            basketId: sourceIdentifier
            // =============================================================================
        };

        let responseJSON = shopPayCart.createResponse(requestData, window.shoppayClientRefs.urls.ShippingAddressChanged);
        const { deliveryMethods } = responseJSON.paymentRequest;

        // Update the payment request based on the shipping address change
        const updatedPaymentRequest = window.ShopPay.PaymentRequest.build({
            ...currentPaymentRequest,
            deliveryMethods: deliveryMethods
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
            // ======= FROM POC....CHECK IF THESE ARE NEEDED IN CONTROLLER CALL ???? =======
            basketId: sourceIdentifier
            // =============================================================================
        };

        let responseJSON = shopPayCart.createResponse(requestData, window.shoppayClientRefs.urls.SubmitPayment);

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


function initBuyNow(e, response) {
    console.log("EVT >>>>> ", e);
    console.log("RESPONSE >>>>> ", response);
    let responseProduct = response.data.product;

    // CONFIRM FUNCTIONALITY OF SIMPLE PDP VS COMPLEX PDP (PAGE INIT VS ATTRIBUTE SELECTION)
    if (responseProduct && responseProduct.buyNow) {
        var readyToOrder = responseProduct.readyToOrder;
        if (readyToOrder) {
            shopPayCart.initShopPaySession(responseProduct.buyNow, readyToOrder);
            productData = {
                pid: responseProduct.id,
                quantity: responseProduct.selectedQuantity,
                options: responseProduct.options
            };
            if (responseProduct.childProducts) {
                productData.childProducts = responseProduct.childProducts;
            }
            // TODO: Handle sets if supported
        }
    }
}


export {
    getCsrfToken,
    getUrlWithCsrfToken,
    isCartEmptyOnLoad,
    setSessionListeners,
    getInitProductData,
    isReadyToOrderOnPageLoad,
    initBuyNow,
    productData,
    setInitProductData
};
