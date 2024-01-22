const helper = require('../helpers/shoppayHelper');

$(document).ready(function () {
    if(window.ShopPay) {
        if(window.shoppayClientRefs.constants.initShopPayEmailRecognition) {
            initShopPayEmailRecognition();
        }

        initShopPayButton();

        const session = initShopPaySession();
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

function initShopPaySession() {
    const paymentRequestResponse = $.ajax({
        url: helper.getUrlWithCsrfToken(window.shoppayClientRefs.urls.GetCartSummary),
        type: 'GET',
        contentType: 'application/json',
        async: false
    }) || {};

    var paymentRequest = paymentRequestResponse.responseJSON.paymentRequest;
    const initialPaymentRequest = window.ShopPay.PaymentRequest.build(paymentRequest);

    return window.ShopPay.PaymentRequest.createSession({
        paymentRequest: initialPaymentRequest
    });
}