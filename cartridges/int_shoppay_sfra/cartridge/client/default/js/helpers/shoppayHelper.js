// Global Variables
let orderConfirmationData;
var sourceIdentifier = null;
var token = null;
var checkoutUrl = null;
var productData = {};
const technicalErrorMsg = window.shoppayClientRefs.constants.technicalError;
let reloadOnClose = true;
let observer;

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
 * @returns {Object} - productData with the following structure: { pid: prodId, quantity: selectedQuantity, options: selectedOptions }
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
 * @param {Object} data - accepts product data obj & updates global productData variable: { pid: prodId, quantity: selectedQuantity, options: selectedOptions }
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
                        /*  session.completeSessionRequest() does not take an errors array as input so just return
                            and use default modal error handling. */
                        return;
                    }
                },
                error: function (err) {
                    // TODO: do we even need this conditional?
                    if (err.responseJSON || err.status !== 200) {
                        /*  session.completeSessionRequest() does not take an errors array as input so just
                            destroy the session and return. */
                        setTimeout(function() {
                            session.close();
                            // Event listeners have loaded so window.location.reload() will be called in windowclosed
                        }, 2000);
                        return;
                    }
                }
            });
        } else {
            sessionPaymentRequest = session.paymentRequest;
        }

        let requestData = {
            paymentRequest: sessionPaymentRequest
        };
        if (window.shoppayClientRefs.constants.isBuyNow) {
            requestData.basketId = sourceIdentifier;
        }

        $.ajax({
            url: getUrlWithCsrfToken(window.shoppayClientRefs.urls.BeginSession),
            method: 'POST',
            async: false,
            data: JSON.stringify(requestData),
            contentType: 'application/json',
            success: function (data) {
                if (!data.error) {
                    token = data.token;
                    checkoutUrl = data.checkoutUrl;
                    sourceIdentifier = data.sourceIdentifier;
                    session.completeSessionRequest({token, checkoutUrl, sourceIdentifier});
                } else {
                    let errorMsg = technicalErrorMsg;
                    if (data.errorMsg) {
                        errorMsg = data.errorMsg;
                    }
                    /*  session.completeSessionRequest() does not take an errors array as input so just return
                        and use default modal error handling. */
                    return;
                }
            },
            error: function (err) {
                // TODO: do we even need this conditional?
                if (err.responseJSON || err.status !== 200) {
                    /*  session.completeSessionRequest() does not take an errors array as input so just
                        destroy the session and return. */
                    setTimeout(function() {
                        session.close();
                        // Event listeners have loaded so window.location.reload() will be called in windowclosed
                    }, 2000);
                    return;
                }
            }

        });
    });

    session.addEventListener("discountcodechanged", function(ev) {
        const currentPaymentRequest = session.paymentRequest;
        let requestData = {
            discountCodes: ev.discountCodes
        };
        if (window.shoppayClientRefs.constants.isBuyNow) {
            requestData.basketId = sourceIdentifier;
        }

        let responseJSON = createResponse(requestData, window.shoppayClientRefs.urls.DiscountCodeChanged);
        if (responseJSON.exception){
            session.completeDiscountCodeChange({
                errors: [
                    {
                        type: "discountCodeError",
                        message: technicalErrorMsg
                    }
                ]
            });
            setTimeout(function() {
                session.close();
                // Event listeners have loaded so window.location.reload() will be called in windowclosed
            }, 2000);
            return;
        } else if (responseJSON.error) {
            let errorMsg = technicalErrorMsg;
            if (responseJSON.errorMsg) {
                errorMsg = responseJSON.errorMsg;
            }
            session.completeDiscountCodeChange({
                errors: [
                    {
                        type: "discountCodeError",
                        message: errorMsg
                    }
                ]
            });
            return;
        }
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

        let responseJSON = createResponse(requestData, window.shoppayClientRefs.urls.DeliveryMethodChanged);
        if (responseJSON.exception) {
            session.completeDeliveryMethodChange({
                errors: [
                    {
                        type: "deliveryMethodError",
                        message: technicalErrorMsg
                    }
                ]
            });
            setTimeout(function() {
                session.close();
                // Event listeners have loaded so window.location.reload() will be called in windowclosed
            }, 2000);
            return;
        } else if (responseJSON.error) {
            let errorMsg = technicalErrorMsg;
            if (responseJSON.errorMsg) {
                errorMsg = responseJSON.errorMsg;
            }
            session.completeDeliveryMethodChange({
                errors: [
                    {
                        type: "deliveryMethodError",
                        message: errorMsg
                    }
                ]
            });
            return;
        }
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
    });

    session.addEventListener("shippingaddresschanged", function(ev) {
        const currentPaymentRequest = session.paymentRequest;
        if (!ev.shippingAddress) {
            /* This event is triggered with no shipping address when a customer clicks "change"
               to choose an alternate email address in the modal */
            session.completeShippingAddressChange({ updatedPaymentRequest: currentPaymentRequest });
            return;
        }
        let requestData = {
            shippingAddress: ev.shippingAddress,
            paymentRequest: currentPaymentRequest,
        };

        if (window.shoppayClientRefs.constants.isBuyNow) {
            requestData.basketId = sourceIdentifier;
        }

        let responseJSON = createResponse(requestData, window.shoppayClientRefs.urls.ShippingAddressChanged);
        if (responseJSON.exception) {
            session.completeShippingAddressChange({
                errors: [
                    {
                        type: "shippingAddressError",
                        message: technicalErrorMsg
                    }
                ]
            });
            setTimeout(function() {
                session.close();
                // Event listeners have loaded so window.location.reload() will be called in windowclosed
            }, 2000);
            return;
        } else if (responseJSON.error) {
            let errorMsg = technicalErrorMsg;
            if (responseJSON.errorMsg) {
                errorMsg = responseJSON.errorMsg;
            }
            session.completeShippingAddressChange({
                errors: [
                    {
                        type: "shippingAddressError",
                        message: errorMsg
                    }
                ]
            });
            return;
        }
        const { deliveryMethods, shippingLines, totalShippingPrice, totalTax, total } = responseJSON.paymentRequest;

        // Update the payment request based on the shipping address change
        const updatedPaymentRequest = window.ShopPay.PaymentRequest.build({
            ...currentPaymentRequest,
            deliveryMethods: deliveryMethods,
            shippingLines: shippingLines,
            totalShippingPrice: totalShippingPrice,
            totalTax: totalTax,
            total: total
        });

        session.completeShippingAddressChange({ updatedPaymentRequest: updatedPaymentRequest });
    });

    session.addEventListener("paymentconfirmationrequested", function(ev) {
        const requestData = {
            token: session.token,
            paymentRequest: session.paymentRequest,
        };

        if (window.shoppayClientRefs.constants.isBuyNow) {
            requestData.basketId = sourceIdentifier;
        }

        let responseJSON = createResponse(requestData, window.shoppayClientRefs.urls.SubmitPayment);
        if (responseJSON.exception) {
            session.completePaymentConfirmationRequest({
                errors: [
                    {
                        type: "paymentConfirmationError",
                        message: technicalErrorMsg
                    }
                ]
            });
            setTimeout(function() {
                session.close();
                // Event listeners have loaded so window.location.reload() will be called in windowclosed
            }, 2000);
            return;
        } else if (responseJSON.error) {
            let errorMsg = technicalErrorMsg;
            if (responseJSON.errorMsg) {
                errorMsg = responseJSON.errorMsg;
            }
            session.completePaymentConfirmationRequest({
                errors: [
                    {
                        type: "paymentConfirmationError",
                        message: errorMsg
                    }
                ]
            });
            return;
        }

        orderConfirmationData = {
            orderID: responseJSON.orderID,
            orderToken: responseJSON.orderToken,
            continueUrl: responseJSON.continueUrl
        };
        session.completePaymentConfirmationRequest();
    });

    session.addEventListener("paymentcomplete", function(ev) {
        reloadOnClose = false;
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

    session.addEventListener("windowclosed", function(ev) {
        // TODO: Remove this line
        console.log("windowclosed (session)");
        // Reset global value to default
        if (!reloadOnClose) {
            reloadOnClose = true;
        } else {
            window.location.reload();
        }
    });
}

/**
 * Enables & Disables Shop Pay's Buy Now button click based on whether the product is ready to order on the PDP
 */
function shopPayBtnDisabledStyle(elem, isReadyToOrder, forceDisable) {
    let readyToOrderPageLoad = isReadyToOrderOnPageLoad();
    let isBuyNow = window.shoppayClientRefs.constants.isBuyNow;

    if (elem) {
        // An error occured, disable the button
        if (!isBuyNow && forceDisable) {
            elem.style.pointerEvents = 'none';
            if (observer) {
                observer.disconnect();
            }
            return;
        }
        if (!isBuyNow || (isBuyNow && (isReadyToOrder || readyToOrderPageLoad))) {
            elem.style.pointerEvents = 'auto';
        } else {
            elem.style.pointerEvents = 'none';
        }
    }
}

/**
 * Watches for when ShopPay button is first rendered to the page to then apply correct button styling depending on whether the basket is empty or not
 */
function shopPayMutationObserver(elemSelector) {
    observer = new MutationObserver((mutationsList, observer) => {
        const renderedShopPayElem = document.querySelector(elemSelector);
        if (renderedShopPayElem) {
            shopPayBtnDisabledStyle(renderedShopPayElem);
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Checks whether a Buy Now product is ready on page load or not (ex: simple products vs. variants with multiple options to choose from, etc.)
 */
function isReadyToOrderOnPageLoad() {
    let readyToOrder = false;
    let $element = document.querySelector('[data-ready-to-order]');
    if ($element && $element.attributes['data-ready-to-order'] && $element.attributes['data-ready-to-order'].value) {
        readyToOrder = $element.attributes['data-ready-to-order'].value === "true";
    }
    return readyToOrder;
}

/**
 * Handles AJAX call to create / update the payment response needed for the ShopPay.PaymentRequest.build() method.
 * @param {Object} requestObj - a request object that contains relevant event data & session data.
 * @param {string} controllerURL - String url of the targeted controller (based on the urls Obj set in shopPayGlobalRefs.js)
 * @returns {Object} responseJSON - an updated response object to be used in the build & on the ShopPay.PaymentRequest object.
 */
function createResponse (requestObj, controllerURL) {
    let responseJSON;
    $.ajax({
        url: getUrlWithCsrfToken(controllerURL),
        method: 'POST',
        async: false,
        data: JSON.stringify(requestObj),
        contentType: 'application/json',
        success: function(data) {
            responseJSON = data;
            responseJSON.exception = false
        },
        error: function (err) {
            responseJSON = err.responseJSON ? err.responseJSON : {};
            responseJSON.exception = true;
        }
    });

    return responseJSON;
}


module.exports = {
    getCsrfToken: getCsrfToken,
    getUrlWithCsrfToken: getUrlWithCsrfToken,
    setSessionListeners: setSessionListeners,
    getInitProductData: getInitProductData,
    productData: productData,
    setInitProductData: setInitProductData,
    shopPayBtnDisabledStyle: shopPayBtnDisabledStyle,
    shopPayMutationObserver: shopPayMutationObserver,
    isReadyToOrderOnPageLoad: isReadyToOrderOnPageLoad,
    createResponse: createResponse
};
