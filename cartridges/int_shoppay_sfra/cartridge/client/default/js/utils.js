'use strict';

const helper = require('./helpers/shoppayHelper')

// Enables & Disables Shop Pay's Buy Now button click based on whether the product is ready to order on the PDP
function shopPayBtnDisabledStyle(elem, isReadyToOrder) {
    let checkoutPage = document.querySelector('#checkout-main');
    let cartPage = document.querySelector('.cart-page');
    let pdpPage = document.querySelector('.product-detail');
    let readyToOrderPageLoad = helper.isReadyToOrder();
    const isPDPcontext = !checkoutPage && !cartPage && pdpPage ? true : false;

    if (elem) {
        if (isPDPcontext || isReadyToOrder || readyToOrderPageLoad) {
            elem.style.pointerEvents = 'auto'; // DOUBLE CHECK IF WORKS ON MOBILE
        } else {
            elem.style.pointerEvents = 'none';
        }
    }
}


// Watches for when ShopPay button is first rendered to the page to then apply correct button styling depending on whether the basket is empty or not
function shopPayMutationObserver(elemSelector) {
    const observer = new MutationObserver((mutationsList, observer) => {
        const renderedShopPayElem = document.querySelector(elemSelector);
        if (renderedShopPayElem) {
            shopPayBtnDisabledStyle(renderedShopPayElem);
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}


module.exports = {
    shopPayBtnDisabledStyle: shopPayBtnDisabledStyle,
    shopPayMutationObserver: shopPayMutationObserver
};
