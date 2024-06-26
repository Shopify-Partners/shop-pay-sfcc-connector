/* Global Variables */
const helper = require('../helpers/shoppayHelper');
const isBuyNow = window.shoppayClientRefs.constants.isBuyNow;
const isAATest = window.shoppayClientRefs.preferences.shoppayAATest ? window.shoppayClientRefs.preferences.shoppayAATest : false;
let session;

$(document).ready(function () {
    if(window.ShopPay) {
        initShopPayConfig();

        if (!isAATest) {
            if(window.shoppayClientRefs.constants.isCheckout && $('#email-guest').length) {
                initShopPayEmailRecognition();
            }

            initShopPayButton();
        }

        let readyOnPageLoad = helper.isReadyToOrderOnPageLoad();
        if (readyOnPageLoad) {
            let pageLoadData = helper.getInitProductData();
            helper.setInitProductData(pageLoadData); // updates global prod data.
        }

        /*  The below code triggers if a product is a Buy Now item, but is not ready to order on page load
            (ex: required product attributes like color or size are not yet chosen). Here, a watcher is set
            to capture user interactions when product attributes are selected. Helper scripts will be triggered
            by these interactions to determine if the item is ready to order when all required attributes are
            selected.
        */
        if (isBuyNow && !readyOnPageLoad) {
            $('body').on('product:afterAttributeSelect', initBuyNow); // receives the Event & Response
        } else {
            session = initShopPaySession();
        }
    }
});

function initShopPayConfig() {
    window.ShopPay.PaymentRequest.configure({
        shopId: window.shoppayClientRefs.preferences.shoppayStoreId,
        clientId: window.shoppayClientRefs.preferences.shoppayClientId,
        debug: window.shoppayClientRefs.preferences.shoppayModalDebugEnabled
    });
}

function initShopPayButton() {
    let paymentSelector = '#shop-pay-button-container';
    window.ShopPay.PaymentRequest.createButton({buyWith: isBuyNow}).render(paymentSelector);
    helper.shoppayMutationObserver(paymentSelector);
}


function initBuyNow(e, response) {
    let responseProduct = response.data.product;
    const { buyNow, readyToOrder, id, selectedQuantity, options, childProducts } = responseProduct;

    if (responseProduct && buyNow) {
        if (readyToOrder) {
            initShopPaySession(buyNow, readyToOrder);
            helper.setInitProductData({
                pid: id,
                quantity: selectedQuantity,
                options: options
            });
            if (childProducts) {
                helper.productData.childProducts = childProducts;
            }
        }
    }
}

function initShopPayEmailRecognition() {
    /*  If your checkout is not built with SFRA or you have customized and removed the 'email-guest'
        id on the email input you will need to update the id value for emailInputId

        Note: A 1.5 second delay has been added before attaching to the email trigger to the email field to
        accommodate users who may have incorporated browser autofills. The pop-up will appear if the field
        is autofilled with a recognized email address
    */
    setTimeout(function() {
        window.ShopPay.PaymentRequest.createLogin({emailInputId: 'email-guest'})
            .render('#shop-pay-login-container');
    }, 1500);
}

$('body').on('cart:update product:afterAddToCart promotion:success', function () {
    /*  Only interested in cart updates on Cart page (cart updates are not triggered in checkout). Buy Now already
        has a separate event handler for changes to attribute selections
    */
    if (window.ShopPay && !isBuyNow) {
        if (!session) {
            session = initShopPaySession();
        } else {
            const paymentRequestResponse = helper.buildPaymentRequest(session);
            const responseJSON =  paymentRequestResponse ? paymentRequestResponse.responseJSON : null;

            if (responseJSON) {
                helper.shoppayBtnDisabledStyle(document.getElementById("shop-pay-button-container"));
            }

            if (responseJSON && !responseJSON.error && responseJSON.paymentRequest !== null) {
                session.close();
                session = initShopPaySession();
            }
        }
    }
});


function initShopPaySession(paymentRequestInput, readyToOrder) {
    let paymentRequest;
    let paymentRequestResponse;
    let responseJSON;

    if (isBuyNow && paymentRequestInput) {
        paymentRequest = paymentRequestInput;
    } else if (isBuyNow && !paymentRequestInput) {
        let productData = helper.getInitProductData();
        if (productData) {
            paymentRequestResponse = helper.createResponse(productData, window.shoppayClientRefs.urls.BuyNowData);
            if (paymentRequestResponse.exception || paymentRequestResponse.error){
                /*  No need to close any session because a session does not exist at this point (has not yet been
                    initiated). Return to exit function - don't reload the page in case there is a page rendering
                    issue (will result in infinite reload loop).
                */
                return;
            }
            paymentRequest = paymentRequestResponse.paymentRequest;
            responseJSON = paymentRequestResponse ? paymentRequestResponse : null;
        }
    } else {
        paymentRequestResponse = helper.buildPaymentRequest(session);
        responseJSON = paymentRequestResponse ? paymentRequestResponse.responseJSON : null;
    }

    if (paymentRequest || (responseJSON && !responseJSON.error)) {
        const initialPaymentRequest = responseJSON && responseJSON.paymentRequest ? window.ShopPay.PaymentRequest.build(responseJSON.paymentRequest) : window.ShopPay.PaymentRequest.build(paymentRequest);
        // Enable BuyNow Button Click on PDP if Product is Ready To Order
        helper.shoppayBtnDisabledStyle(document.getElementById("shop-pay-button-container"), readyToOrder);

        let shoppaySession = window.ShopPay.PaymentRequest.createSession({
            paymentRequest: initialPaymentRequest
        });

        if (shoppaySession) {
            helper.setSessionListeners(shoppaySession);
            $('body').off('product:afterAttributeSelect', initBuyNow);

            $('body').on('product:afterAttributeSelect', function(e, response) {
                let responseProduct = response.data.product;
                if (isBuyNow && responseProduct.buyNow) {
                    helper.setInitProductData({
                        pid: responseProduct.id,
                        quantity: responseProduct.selectedQuantity,
                        options: responseProduct.options
                    });
                    if (shoppaySession) {
                        shoppaySession.close();
                        let updatedPaymentRequest = window.ShopPay.PaymentRequest.build(responseProduct.buyNow);
                        shoppaySession = window.ShopPay.PaymentRequest.createSession({
                            paymentRequest: updatedPaymentRequest
                        });

                        helper.setSessionListeners(shoppaySession);
                    }

                } else {
                    $.ajax({
                        url: helper.getUrlWithCsrfToken(window.shoppayClientRefs.urls.GetCartSummary),
                        type: 'GET',
                        contentType: 'application/json',
                        async: false,
                        success: function (data) {
                            if (!data.error) {
                                if (shoppaySession) {
                                    shoppaySession.close();
                                }
                                let paymentRequest = window.ShopPay.PaymentRequest.build(response.product.buyNow);
                                shoppaySession = window.ShopPay.PaymentRequest.createSession({
                                    paymentRequest: paymentRequest
                                });
                                helper.setSessionListeners(shoppaySession);
                            }
                        },
                        error: function (err) {
                            if (err.responseJSON || err.status !== 200) {
                                session.close();
                                // modal hasn't opened yet so "windowclosed" listener won't fire
                                window.location.reload();
                                return;
                            }
                        }
                    });
                }
            });
        }

        return shoppaySession;
    }
}


module.exports = {
    initShopPaySession: initShopPaySession
};
