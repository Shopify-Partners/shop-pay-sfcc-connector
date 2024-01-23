const helper = require('../helpers/shoppayHelper');

let session;

$(document).ready(function () {
    console.log("RUNNING!!!!!")
    if(window.ShopPay) {
        if(window.shoppayClientRefs.constants.initShopPayEmailRecognition) {
            initShopPayEmailRecognition();
        }

        initShopPayButton();

        // const session = initShopPaySession();
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

    window.ShopPay.PaymentRequest.createButton().render('#shop-pay-button-container');
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

$('body').on('cart:update, product:afterAddToCart', function () {
    // updateMiniCart = true;

    // CHECK TO ENSURE THE CART ISN'T EMPTY BEFORE CALLING THIS!!!
    // ALSO CONSIDER CHECKING IF THERE"S A SESSIOn

    if (!window.ShopPay || !session) {
        session = initShopPaySession();
        // initShopPaySession();
    } else {
        const paymentRequestResponse = $.ajax({
            url: helper.getUrlWithCsrfToken(window.shoppayClientRefs.urls.GetCartSummary),
            type: 'GET',
            contentType: 'application/json',
            async: false
        }) || {};

        if (paymentRequestResponse.responseJSON.paymentRequest !== null) {
            session.completeDiscountCodeChange(paymentRequestResponse.responseJSON.paymentRequest);
        }
    }
});


function initShopPaySession() {
    // ====== CONSIDER EXTERNALIZING THIS INTO SEPARATE FUNC!
    const paymentRequestResponse = $.ajax({
        url: helper.getUrlWithCsrfToken(window.shoppayClientRefs.urls.GetCartSummary),
        type: 'GET',
        contentType: 'application/json',
        async: false
    }) || {};
    // ======

    var paymentRequest = paymentRequestResponse.responseJSON;

    // checkfor error...and be sure the payment request isn't null!
    if (!paymentRequest.error && paymentRequest.paymentRequest !== null) {
        const initialPaymentRequest = window.ShopPay.PaymentRequest.build(paymentRequest);

        return window.ShopPay.PaymentRequest.createSession({
            paymentRequest: initialPaymentRequest
        });
    }
}