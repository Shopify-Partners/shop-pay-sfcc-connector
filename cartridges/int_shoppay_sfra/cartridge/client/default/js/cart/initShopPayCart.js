const helper = require('../helpers/shoppayHelper');
const utils = require('../utils');

let session;

$(document).ready(function () {
    if(window.ShopPay) {
        if(window.shoppayClientRefs.constants.initShopPayEmailRecognition) {
            initShopPayEmailRecognition();
        }

        initShopPayButton();

        let readyOnPageLoad = utils.isReadyToOrderOnPageLoad();
        if (readyOnPageLoad) {
            let pageLoadData = helper.getInitProductData();
            helper.setInitProductData(pageLoadData); // updates global prod data.
        }

        /*
        /* The below code triggers if a product is a Buy Now item, but is not ready to order on page load (ex: required product attributes like color or size are not yet chosen).
        /* Here, a watcher is set to capture user interactions when product attributes are selected. Helper scripts will be triggered by these interactions to determine if the item
        /* is ready to order when all required attributes are selected.
        */
        if (window.shoppayClientRefs.constants.isBuyNow && !readyOnPageLoad) {
            $('body').on('product:afterAttributeSelect', helper.initBuyNow); // receives the Event & Response
        } else {
            session = initShopPaySession();
        }
    }
});

function initShopPayConfig() {
    window.ShopPay.PaymentRequest.configure({
        shopId: window.shoppayClientRefs.preferences.shoppayStoreId,
        clientId: window.shoppayClientRefs.preferences.shoppayClientId,
    });
}

function initShopPayButton() {
    initShopPayConfig();

    let paymentSelector = '#shop-pay-button-container';
    window.ShopPay.PaymentRequest.createButton().render(paymentSelector);
    utils.shopPayMutationObserver(paymentSelector);
}

function initShopPayEmailRecognition() {
    initShopPayConfig();

    /*
    /* If your checkout is not built with SFRA or you have custimized and removed the 'email-guest'
    /* id on the email input you will need to update the id value for emailInputId
    */
    window.ShopPay.PaymentRequest.createLogin({emailInputId: 'email-guest'})
        .render('#shop-pay-login-container');
}

$('body').on('cart:update product:afterAddToCart promotion:success', function () {
    /* Only interested in cart updates on Cart page (cart updates are not triggered in checkout). Buy Now already
    has a separate event handler for changes to attribute selections */
    if (window.ShopPay && !window.shoppayClientRefs.constants.isBuyNow) {
        if (!session) {
            session = initShopPaySession();
        } else {
            const paymentRequestResponse = buildPaymentRequest();
            const responseJSON =  paymentRequestResponse ? paymentRequestResponse.responseJSON : null;

            if (responseJSON) {
                utils.shopPayBtnDisabledStyle(document.getElementById("shop-pay-button-container"));
            }

            if (responseJSON && !responseJSON.error && responseJSON.paymentRequest !== null) {
                session.close();
                session = initShopPaySession();

                // TODO: remove these debugging lines before final delivery
                console.log('RESPONSE JSON >>>> ', responseJSON.paymentRequest)
                console.log('SESSION Obj >>>> ', session.paymentRequest)
            }
        }
    }
});


function initShopPaySession(paymentRequestInput, readyToOrder) {
    let isBuyNow = window.shoppayClientRefs.constants.isBuyNow;
    let paymentRequest;
    let paymentRequestResponse;
    let responseJSON;

    if (isBuyNow && paymentRequestInput) {
        paymentRequest = paymentRequestInput;
    } else if (isBuyNow && !paymentRequestInput) {
        let productData = helper.getInitProductData();
        if (productData) {
            paymentRequestResponse = createResponse(productData, window.shoppayClientRefs.urls.BuyNowData);
            paymentRequest = paymentRequestResponse.paymentRequest;
            responseJSON = paymentRequestResponse ? paymentRequestResponse : null;
        }
    } else {
        paymentRequest = buildPaymentRequest();
        responseJSON = paymentRequest ? paymentRequest.responseJSON : null;
    }

    if (paymentRequest || (responseJSON && !responseJSON.error)) {
        const initialPaymentRequest = responseJSON && responseJSON.paymentRequest ? window.ShopPay.PaymentRequest.build(responseJSON.paymentRequest) : window.ShopPay.PaymentRequest.build(paymentRequest);
        utils.shopPayBtnDisabledStyle(document.getElementById("shop-pay-button-container"), readyToOrder); // Enable BuyNow Button Click on PDP if Product is Ready To Order

        let shopPaySession = window.ShopPay.PaymentRequest.createSession({
            paymentRequest: initialPaymentRequest
        });

        if (shopPaySession) {
            helper.setSessionListeners(shopPaySession);
            $('body').off('product:afterAttributeSelect', helper.initBuyNow);

            $('body').on('product:afterAttributeSelect', function(e, response) {
                let responseProduct = response.data.product;
                if (window.shoppayClientRefs.constants.isBuyNow && responseProduct.buyNow) {
                    helper.setInitProductData({
                        pid: responseProduct.id,
                        quantity: responseProduct.selectedQuantity,
                        options: responseProduct.options
                    });
                    if (shopPaySession) {
                        shopPaySession.close();
                        let updatedPaymentRequest = window.ShopPay.PaymentRequest.build(responseProduct.buyNow);
                        shopPaySession = window.ShopPay.PaymentRequest.createSession({
                            paymentRequest: updatedPaymentRequest
                        });

                        helper.setSessionListeners(shopPaySession);
                    }

                } else {
                    $.ajax({
                        url: helper.getUrlWithCsrfToken(window.shoppayClientRefs.urls.GetCartSummary),
                        type: 'GET',
                        contentType: 'application/json',
                        async: false,
                        success: function (data) {
                            if (!data.error) {
                                if (shopPaySession) {
                                    shopPaySession.close();
                                }
                                let paymentRequest = window.ShopPay.PaymentRequest.build(response.product.buyNow);
                                shopPaySession = window.ShopPay.PaymentRequest.createSession({
                                    paymentRequest: paymentRequest
                                });
                                helper.setSessionListeners(shopPaySession);
                                console.log(shopPaySession.paymentRequest);
                            } else {
                                console.log(data.errorMsg);
                            }
                        },
                        error: function (err) {
                            // TODO:
                            console.log("ERROR:  ", err);
                        }
                    });
                }
            });
        }

        return shopPaySession;
    }
}

/**
 * Handles AJAX call to get the payment response.
 * @returns {Object} paymentResponse - an response object.
 */
function buildPaymentRequest () {
    let token = document.querySelector('[data-csrf-token]');
    if (token) {
        const paymentResponse = $.ajax({
            url: helper.getUrlWithCsrfToken(window.shoppayClientRefs.urls.GetCartSummary),
            type: 'GET',
            contentType: 'application/json',
            async: false
        }) || {};

        return paymentResponse;
    } else {
        session.close();
    }
}

/**
 * Handles AJAX call to create / update the payment response needed for the ShopPay.PaymentRequest.build() method.
 * @param {Object} requestObj - a request object that contains relevant event data & session data.
 * @param {string} controllerURL - String url of the targeted controller (based on the urls Obj set in shopPayGlobalRefs.js)
 * @returns {Object} responseJSON - an updated response object to be used in the build & on the ShopPay.PaymentRequest object.
 */
function createResponse (requestObj, controllerURL) {
    let responseJSON = $.ajax({
        url: helper.getUrlWithCsrfToken(controllerURL),
        method: 'POST',
        async: false,
        data: JSON.stringify(requestObj),
        contentType: 'application/json'
    }).responseJSON;

    return responseJSON;
}


export {
    initShopPaySession,
    createResponse
};
