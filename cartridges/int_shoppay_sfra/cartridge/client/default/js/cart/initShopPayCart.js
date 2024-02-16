const helper = require('../helpers/shoppayHelper');
const utils = require('../utils');

let session;
let readyOnPageLoad;

$(document).ready(function () {
    if(window.ShopPay) {
        if(window.shoppayClientRefs.constants.initShopPayEmailRecognition) {
            initShopPayEmailRecognition();
        }

        initShopPayButton();

        readyOnPageLoad = utils.isReadyToOrderOnPageLoad();
        if (readyOnPageLoad) {
            let pageLoadData = helper.getInitProductData();
            helper.setInitProductData(pageLoadData); // updates global prod data.
        }

        var readyToOrder = utils.isReadyToOrderOnPageLoad();
        if (window.shoppayClientRefs.constants.isBuyNow && !readyToOrder) {
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
        utils.shopPayBtnDisabledStyle(document.getElementById("shop-pay-button-container"), readyToOrder) // Enable BuyNow Button Click on PDP if Product is Ready To Order

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
                    })
                    if (shopPaySession) {
                        shopPaySession.close();
                        let updatedPaymentRequest = window.ShopPay.PaymentRequest.build(responseProduct.buyNow);
                        shopPaySession = window.ShopPay.PaymentRequest.createSession({
                            paymentRequest: updatedPaymentRequest
                        });

                        helper.setSessionListeners(shopPaySession);
                    }

                } else {
                    // NOTE...ADD THE SUCCESS & ERROR FUNCTIONS INTO THE buildPaymentRequest FUNCTION AND USE INSTEAD...???
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
                                var PR = window.ShopPay.PaymentRequest.build(response.product.buyNow);
                                shopPaySession = window.ShopPay.PaymentRequest.createSession({
                                    paymentRequest: PR
                                });
                                helper.setSessionListeners(shopPaySession);
                                console.log(shopPaySession.paymentRequest);
                            } else {
                                console.log(data.errorMsg);
                            }
                        },
                        error: function (err) {
                            // TODO
                            console.log("ERROR:  ", err)
                        }
                    });
                }
            });
        }

        return shopPaySession;
    }
}

// Handles AJAX call to get the payment response
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

// Handles AJAX call to create / update the payment response needed for the ShopPay.PaymentRequest.build() method.
function createResponse (requestObj, controllerURL) {
    let responseJSON = $.ajax({
        url: helper.getUrlWithCsrfToken(controllerURL),
        method: 'POST',
        async: false,
        data: JSON.stringify(requestObj),
        contentType: 'application/json'
    }).responseJSON;

    return responseJSON
}


export {
    initShopPaySession,
    readyOnPageLoad,
    createResponse
};
