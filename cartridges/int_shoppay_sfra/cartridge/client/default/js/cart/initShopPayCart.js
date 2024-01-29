const helper = require('../helpers/shoppayHelper');

$(document).ready(function () {
    var basketId;
    if(window.ShopPay) {
        if(window.shoppayClientRefs.constants.initShopPayEmailRecognition) {
            initShopPayEmailRecognition();
        }

        initShopPayButton();

        // TODO: Revert and fix Cart/Checkout init
        //const session = initShopPaySession();
        //console.log(session.paymentRequest);

        if(window.shoppayClientRefs.constants.isBuyNow) {
            $('body').on('product:updateAddToCart', function (e, response) {
                var requestData = {
                    pid: response.product.id,
                    quantity: response.product.selectedQuantity,
                    options: response.product.options
                };
                $.ajax({
                    url: helper.getUrlWithCsrfToken(window.shoppayClientRefs.urls.PrepareBasket),
                    method: 'POST',
                    async: false,
                    data: JSON.stringify(requestData),
                    contentType: 'application/json',
                    success: function (response) {
                        if (!response.error) {
                            basketId = response.basketId;
                            initShopPaySession(basketId);
                        } else {
                            console.log(response.errorMsg);
                        }
                    },
                    error: function () {
                        // TODO
                    }
                });
            });
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

function initShopPaySession(basketId) {

    const paymentRequestResponse = $.ajax({
        url: helper.getUrlWithCsrfToken(window.shoppayClientRefs.urls.GetCartSummary, basketId),
        type: 'GET',
        contentType: 'application/json',
        async: false
    }) || {};

    var paymentRequest = paymentRequestResponse.responseJSON.paymentRequest;
    const initialPaymentRequest = window.ShopPay.PaymentRequest.build(paymentRequest);

    session =  window.ShopPay.PaymentRequest.createSession({
        paymentRequest: initialPaymentRequest
    });

    session.addEventListener("sessionrequested", function (ev) {
        // Shop Pay Payment Request Session on your server
        console.log(ev);
        var requestData = {
            paymentRequest: session.paymentRequest
        };
        // TODO: only passing basketId for temp baskets right now.... try to add to all for robustness
        if (basketId) {
            requestData.basketId = basketId;
        }
        $.ajax({
            url: helper.getUrlWithCsrfToken(window.shoppayClientRefs.urls.BeginSession),
            method: 'POST',
            async: false,
            data: JSON.stringify(requestData),
            contentType: 'application/json',
            success: function (data) {
                const {token, checkoutUrl, sourceIdentifier} = data;
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
        console.log(ev);
        const currentPaymentRequest = session.paymentRequest;
        const selectedAddress = ev.shippingAddress;

        // Update the payment request based on the shipping address change
        const updatedPaymentRequest = window.ShopPay.PaymentRequest.build({
            ...currentPaymentRequest,
            deliveryMethods: [
                {
                    "amount": {
                        "amount": 5.99,
                        "currencyCode": "USD"
                    },
                    "code": "001",
                    "deliveryExpectationLabel": "7-10 Business Days",
                    "detail": "Ground",
                    "label": "Ground",
                    "maxDeliveryDate": "2024-02-05",
                    "minDeliveryDate": "2024-01-30"
                },
                {
                    "amount": {
                        "amount": 9.99,
                        "currencyCode": "USD"
                    },
                    "code": "002",
                    "deliveryExpectationLabel": "2 Business Days",
                    "detail": "2-Day Express",
                    "label": "2-Day Express",
                    "maxDeliveryDate": "2024-02-05",
                    "minDeliveryDate": "2024-01-30"
                },
                {
                    "amount": {
                        "amount": 15.99,
                        "currencyCode": "USD"
                    },
                    "code": "003",
                    "deliveryExpectationLabel": "Next Day",
                    "detail": "Overnight",
                    "label": "Overnight",
                    "maxDeliveryDate": "2024-02-05",
                    "minDeliveryDate": "2024-01-30"
                },
                {
                    "amount": {
                        "amount": 0,
                        "currencyCode": "USD"
                    },
                    "code": "101",
                    "deliveryExpectationLabel": "1 Business Day",
                    "detail": "E-Delivery",
                    "label": "E-Delivery",
                    "maxDeliveryDate": "2024-02-05",
                    "minDeliveryDate": "2024-01-30"
                }
            ]
        });

        session.completeShippingAddressChange({ updatedPaymentRequest: updatedPaymentRequest });
        console.log(updatedPaymentRequest);
    });

    session.addEventListener("deliverymethodchanged", function(ev) {
        console.log(ev);
        const currentPaymentRequest = session.paymentRequest;
        const selectedDeliveryMethod = ev.deliveryMethod;

        // Update the payment request based on the delivery method change
        // and update the total accordingly
        const updatedPaymentRequest = window.ShopPay.PaymentRequest.build({
            ...currentPaymentRequest,
            shippingLines: [{
                label: selectedDeliveryMethod.label,
                amount: selectedDeliveryMethod.amount,
                code: selectedDeliveryMethod.code
            }],
            total: {
                amount: 56.68, // TODO: Get real dynamic total
                currencyCode: "USD"
            }
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
