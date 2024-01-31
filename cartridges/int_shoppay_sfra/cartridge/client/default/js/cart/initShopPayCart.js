const helper = require('../helpers/shoppayHelper');
const utils = require('../../../../../../int_shoppay/cartridge/scripts/utils');

let session;

$(document).ready(function () {
    if(window.ShopPay) {
        if(window.shoppayClientRefs.constants.initShopPayEmailRecognition) {
            initShopPayEmailRecognition();
        }

        initShopPayButton();

        session = initShopPaySession();

        // set up shopPay listeners ?????
        // helper.setShopPaySessionListeners(session);
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
    let paymentRequestResponse = buildPaymentRequest();
    const cartIsEmpty =  paymentRequestResponse && paymentRequestResponse.responseJSON ? paymentRequestResponse.responseJSON.error : null;
    utils.shopPayMutationObserver(paymentSelector, cartIsEmpty);  // set mutation observ. to apply correct btn styles when this element is rendered to the DOM (based on whether basket is empty or not)
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

$('body').on('cart:update product:afterAddToCart product:updateAddToCart', function () {
    if (window.ShopPay) {
        if (!session) {
            session = initShopPaySession();
            // TODO: remove this debugging line before final delivery
            console.log('SESSION Obj >>>> ', session.paymentRequest)

            // // set up shopPay listeners???
            // helper.setShopPaySessionListeners(session);
        } else {
            const paymentRequestResponse = buildPaymentRequest();
            const responseJSON =  paymentRequestResponse ? paymentRequestResponse.responseJSON : null;

            if (responseJSON) {
                utils.shopPayBtnDisabledStyle(document.getElementById("shop-pay-button-container"), responseJSON.error);
            }

            if (responseJSON && !responseJSON.error && responseJSON.paymentRequest !== null) {
                // TODO: Rework this update to the session object. Need to update with a proper method rather than destroying / recreating a session after updates. (Note: previously attempted with session.completeDiscountCodeChange(responseJSON.paymentRequest), but was not working on Shopify Side)
                // Awaiting Feedback from ShopPay team
                session.close();
                session = initShopPaySession();

                // TODO: remove these debugging lines before final delivery
                console.log('RESPONSE JSON >>>> ', responseJSON.paymentRequest)
                console.log('SESSION Obj >>>> ', session.paymentRequest)

                // // set up shopPay listeners (WOULD THIS STILL GO HERE IF NEW METHOD FROM SHOPPAY IS CREATED)???
                // helper.setShopPaySessionListeners(session);
            }
        }
    }
});


function initShopPaySession() {
    const paymentRequestResponse = buildPaymentRequest();
    const responseJSON = paymentRequestResponse ? paymentRequestResponse.responseJSON : null;
    // TODO: remove this debugging line before final delivery
    console.log(JSON.stringify(responseJSON.paymentRequest));

    if (!responseJSON.error && responseJSON.paymentRequest !== null) {
        const initialPaymentRequest = window.ShopPay.PaymentRequest.build(responseJSON.paymentRequest);
        utils.shopPayBtnDisabledStyle(document.getElementById("shop-pay-button-container"), responseJSON.error) // basket NOT empty. Update btn styles (remove opacity)

        const shopPaySession = window.ShopPay.PaymentRequest.createSession({
            paymentRequest: initialPaymentRequest
        });

        helper.setShopPaySessionListeners(shopPaySession);
        return shopPaySession;

        // return window.ShopPay.PaymentRequest.createSession({
        //     paymentRequest: initialPaymentRequest
        // });
    }
}

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
