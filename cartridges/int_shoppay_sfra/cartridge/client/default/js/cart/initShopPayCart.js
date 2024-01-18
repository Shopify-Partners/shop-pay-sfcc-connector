$(document).ready(function () {
    if(window.ShopPay) {
        /*
        /* We need to know if the user is in checkout so we can include the email recognition code
        /* If your checkout is not built with SFRA or you have custimized and removed the 'checkout-main'
        /* id you will need to update this if statment to recongnize when you are on the checkout page
        */
        if(document.getElementById('checkout-main')) {
            initShopPayEmailRecognition();
        }
        
        initShopPayButton();
    }
});

const initShopPayConfig = () => {
    window.ShopPay.PaymentRequest.configure({
        shopId: window.shoppayClientRefs.preferences.shoppayStoreId,
        clientId: window.shoppayClientRefs.preferences.shoppayClientId,
    });

}

const initShopPayButton = () => {
    initShopPayConfig();

    window.ShopPay.PaymentRequest.createButton().render('#shop-pay-button-container');
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