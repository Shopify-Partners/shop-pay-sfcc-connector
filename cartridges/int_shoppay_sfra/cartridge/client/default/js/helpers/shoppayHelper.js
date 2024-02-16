// Imported Files
const shopPayCart = require('../cart/initShopPayCart');

// Global Variables
let orderConfirmationData;
var sourceIdentifier = null;
var token = null;
var checkoutUrl = null;
var productData = {};

/**
 * Add csrf token param to url
 * @param {string} url - source url
 * @param {string} basketId - UUID of the temporary basket in the session, if applicable
 * @returns {string} - url with csrf_token param
 */
function getUrlWithCsrfToken(url, basketId) {
    const urlInstance = new URL(url, location.origin);

    urlInstance.searchParams.append('csrf_token', getCsrfToken());

    if (basketId) {
        urlInstance.searchParams.append('basketId', basketId);
    }

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

/**
 * Get Init Product Data (page load and captures data available on page load)
 * @returns {Object} - productData witht he following structure: { pid: prodId, quantity: selectedQuantity, options: selectedOptions }
 */
function getInitProductData() {
    let productData = null;
    let $element = document.querySelector('[data-buy-now-init]');
    if ($element && $element.attributes['data-buy-now-init'] && $element.attributes['data-buy-now-init'].value) {
        productData = JSON.parse($element.attributes['data-buy-now-init'].value);
    }
    return productData;
}

/**
 * Set Init Product Data
 * @param {Object} data - accepts product data obj & updates global productData variable.  { pid: prodId, quantity: selectedQuantity, options: selectedOptions }
 */
function setInitProductData(data) {
    productData = data;
}

/**
 * Sets Up ShopPay listener Events
 * @param {Object} session - Accepts the Shop Pay session object and establishes necessary event listeners on the session.
 */
function setSessionListeners(session) {
    session.addEventListener("sessionrequested", function (ev) {
        let sessionPaymentRequest;

        if (window.shoppayClientRefs.constants.isBuyNow) {
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
            sessionPaymentRequest = session.paymentRequest;
        }

        let requestData = {
            paymentRequest: sessionPaymentRequest,
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
            discountCodes: ev.discountCodes,
        };
        let isBuyNow = window.shoppayClientRefs.constants.isBuyNow;
        if (isBuyNow && window.shoppayClientRefs.constants.isBuyNow) {
            requestData.basketId = sourceIdentifier;
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
        let requestData = {
            deliveryMethod: ev.deliveryMethod,
            paymentRequest: currentPaymentRequest,
        };

        if (window.shoppayClientRefs.constants.isBuyNow) {
            requestData.basketId = sourceIdentifier;
        }

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
        console.log("Updated Payment Req w/ entered Delivery Method: ", updatedPaymentRequest);
    });

    session.addEventListener("shippingaddresschanged", function(ev) {
        const currentPaymentRequest = session.paymentRequest;
        let requestData = {
            shippingAddress: ev.shippingAddress,
            paymentRequest: currentPaymentRequest,
        };

        if (window.shoppayClientRefs.constants.isBuyNow) {
            requestData.basketId = sourceIdentifier;
        }

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
        console.log("Updated Payment Req w/ entered Shipping Address: ", updatedPaymentRequest);
    });

    session.addEventListener("paymentconfirmationrequested", function(ev) {
        let requestData = {
            token: session.token,
            paymentRequest: session.paymentRequest,
        };

        if (window.shoppayClientRefs.constants.isBuyNow) {
            requestData.basketId = sourceIdentifier;
        }

        let responseJSON = shopPayCart.createResponse(requestData, window.shoppayClientRefs.urls.SubmitPayment);

        orderConfirmationData = {
            orderID: responseJSON.orderID,
            orderToken: responseJSON.orderToken,
            continueUrl: responseJSON.continueUrl
        };
        session.completePaymentConfirmationRequest();
        // TODO: remove this debugging line before final delivery
        console.log('paymentconfirmationrequested', ev);
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
    let responseProduct = response.data.product;

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
        }
    }
}


module.exports = {
    getCsrfToken: getCsrfToken,
    getUrlWithCsrfToken: getUrlWithCsrfToken,
    setSessionListeners: setSessionListeners,
    getInitProductData: getInitProductData,
    initBuyNow: initBuyNow,
    productData: productData,
    setInitProductData: setInitProductData
};
