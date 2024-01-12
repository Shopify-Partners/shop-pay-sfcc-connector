$(document).ready(function () {
    if(window.ShopPay) {
        /*
        /* We need to know if the user is in checkout so we can include the email recognition code
        /* If your checkout is not built with SFRA or you have custimized and removed the 'checkout-main'
        /* id you will need to update this if statment to recongnize when you are on the checkout page
        */
        if(document.getElementById('checkout-main')) {
            initShopPayEmailRecognition();
        } else {
            initShopPayButton();
        }
    }
});

const initShopPayConfig = () => {
    window.ShopPay.PaymentRequest.configure({
        shopId: 62164762779,
        clientId: "79914172417",
    });

}

const initShopPayButton = () => {
    initShopPayConfig();

    //not sure I like haveing to resolve the promise like this there docs dont day anything about having to do this
    window.ShopPay.PaymentRequest.createButton().render('#shop-pay-button-container')
        .then((res) => 
            document.getElementById('shop-pay-button-container').innerHTML = res.outerHTML
        );
}

const initShopPayEmailRecognition = () => {
    initShopPayConfig();

    /*
    /* If your checkout is not built with SFRA or you have custimized and removed the 'email-guest'
    /* id on the email input you will need to update the id value for emailInputId
    */
    window.ShopPay.PaymentRequest.createLogin({emailInputId: 'email-guest'})
        .render('#shop-pay-login-container');
}