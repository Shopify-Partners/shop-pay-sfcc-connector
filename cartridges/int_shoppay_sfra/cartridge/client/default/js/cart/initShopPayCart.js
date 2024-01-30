const helper = require('../helpers/shoppayHelper');
var sourceIdentifier = null;
var token = null;
var checkoutUrl = null;
var productData = {};

$(document).ready(function () {
    if(window.ShopPay) {
        if(window.shoppayClientRefs.constants.initShopPayEmailRecognition) {
            initShopPayEmailRecognition();
        }

        initShopPayButton();

        if (window.shoppayClientRefs.constants.isBuyNow) {
            $('body').on('product:updateAddToCart', initBuyNow);
        } else {
            initShopPaySession();
        }
    }
});

function initBuyNow(e, response) {
    if (response.product && response.product.buyNow) {
        var product = response.product;
        initShopPaySession(product.buyNow);
        productData = {
            pid: product.id,
            quantity: product.selectedQuantity,
            options: product.options
        };
    }
}

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

function addEventListeners(session) {
    session.addEventListener("sessionrequested", function (ev) {
        // Shop Pay Payment Request Session on your server
        console.log(ev);
        var paymentRequest;
        if (window.shoppayClientRefs.constants.isBuyNow) {
            $.ajax({
                url: helper.getUrlWithCsrfToken(window.shoppayClientRefs.urls.PrepareBasket),
                method: 'POST',
                async: false,
                data: JSON.stringify(productData),
                contentType: 'application/json',
                success: function (data) {
                    if (!data.error) {
                        paymentRequest = data.paymentRequest;
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
            paymentRequest = session.paymentRequest
        }
        // TODO: only passing basketId for temp baskets right now.... try to add to all for robustness
        var requestData = {
            paymentRequest: paymentRequest,
            basketId: sourceIdentifier
        };

        $.ajax({
            url: helper.getUrlWithCsrfToken(window.shoppayClientRefs.urls.BeginSession),
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
        console.log(ev);
    });

    session.addEventListener("shippingaddresschanged", function(ev) {
        //console.log(ev);
        const currentPaymentRequest = session.paymentRequest;
        const selectedAddress = ev.shippingAddress;
        var requestData = {
            selectedAddress: selectedAddress,
            paymentRequest: currentPaymentRequest,
            basketId: sourceIdentifier
        };

        var responseJSON = $.ajax({
            url: helper.getUrlWithCsrfToken(window.shoppayClientRefs.urls.ShippingAddressChanged),
            method: 'POST',
            async: false,
            data: JSON.stringify(requestData),
            contentType: 'application/json'
        }).responseJSON;

        // Update the payment request based on the shipping address change
        const updatedPaymentRequest = window.ShopPay.PaymentRequest.build({
            ...currentPaymentRequest,
            deliveryMethods: responseJSON.paymentRequest.deliveryMethods
        });

        session.completeShippingAddressChange({ updatedPaymentRequest: updatedPaymentRequest });
        console.log(updatedPaymentRequest);
    });

    session.addEventListener("deliverymethodchanged", function(ev) {
        //console.log(ev);
        const currentPaymentRequest = session.paymentRequest;
        const selectedDeliveryMethod = ev.deliveryMethod;
        var requestData = {
            selectedDeliveryMethod: selectedDeliveryMethod,
            paymentRequest: currentPaymentRequest,
            basketId: sourceIdentifier
        };

        var responseJSON = $.ajax({
            url: helper.getUrlWithCsrfToken(window.shoppayClientRefs.urls.DeliveryMethodChanged),
            method: 'POST',
            async: false,
            data: JSON.stringify(requestData),
            contentType: 'application/json'
        }).responseJSON;

        // Update the payment request based on the delivery method change
        // and update the total accordingly
        const updatedPaymentRequest = window.ShopPay.PaymentRequest.build({
            ...currentPaymentRequest,
            shippingLines: responseJSON.paymentRequest.shippingLines,
            totalShippingPrice: responseJSON.paymentRequest.totalShippingPrice,
            totalTax: responseJSON.paymentRequest.totalTax,
            total: responseJSON.paymentRequest.total
        });

        session.completeDeliveryMethodChange({ updatedPaymentRequest: updatedPaymentRequest });
    });

    session.addEventListener("paymentconfirmationrequested", function(ev) {
        console.log(ev);
    });

    session.addEventListener("paymentcomplete", function(ev) {
        console.log(ev);
    });
}

function initShopPaySession(paymentRequestInput) {
    const isBuyNow = window.shoppayClientRefs.constants.isBuyNow;
    var paymentRequest;
    if (isBuyNow) {
        paymentRequest = paymentRequestInput;
    } else {
        paymentRequestResponse = $.ajax({
            url: helper.getUrlWithCsrfToken(window.shoppayClientRefs.urls.GetCartSummary),
            type: 'GET',
            contentType: 'application/json',
            async: false
        }) || {};
        paymentRequest = paymentRequestResponse.responseJSON.paymentRequest;
    }

    const initialPaymentRequest = window.ShopPay.PaymentRequest.build(paymentRequest);

    var session = window.ShopPay.PaymentRequest.createSession({
        paymentRequest: initialPaymentRequest
    });
    addEventListeners(session);
    console.log(session.paymentRequest);

    $('body').off('product:updateAddToCart', initBuyNow);

    $('body').on('product:updateAddToCart', function(e, response) {
        if (window.shoppayClientRefs.constants.isBuyNow && response.product.buyNow) {
            if (session) {
                session.close();
            }
            var PR = window.ShopPay.PaymentRequest.build(response.product.buyNow);
            session = window.ShopPay.PaymentRequest.createSession({
                paymentRequest: PR
            });
            addEventListeners(session);

            // var updatedPR = window.ShopPay.PaymentRequest.build({
            //     ...session.paymentRequest,
            //     paymentRequest: response.product.buyNow
            // });
            // session.completeDiscountCodeChange({updatedPaymentRequest: updatedPR});

            console.log(session.paymentRequest);
            productData = {
                pid: response.product.id,
                quantity: response.product.selectedQuantity,
                options: response.product.options
            };
        } else {
            $.ajax({
                url: helper.getUrlWithCsrfToken(window.shoppayClientRefs.urls.GetCartSummary),
                type: 'GET',
                contentType: 'application/json',
                async: false,
                success: function (data) {
                    if (!data.error) {
                        if (session) {
                            session.close();
                        }
                        var PR = window.ShopPay.PaymentRequest.build(response.product.buyNow);
                        session = window.ShopPay.PaymentRequest.createSession({
                            paymentRequest: PR
                        });
                        addEventListeners(session);

                        // var updatedPR = window.ShopPay.PaymentRequest.build({
                        //     ...session.paymentRequest,
                        //     paymentRequest: data.paymentRequest
                        // });
                        // session.completeDiscountCodeChange({updatedPaymentRequest: updatedPR});

                        console.log(session.paymentRequest);
                    } else {
                        console.log(data.errorMsg);
                    }
                },
                error: function () {
                    // TODO
                }
            });
        }
    });


}
