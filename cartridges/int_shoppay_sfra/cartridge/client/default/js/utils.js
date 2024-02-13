'use strict';

const helper = require('./helpers/shoppayHelper')

// Enables & Disables Shop Pay's Buy Now button click based on whether the product is ready to order on the PDP
function shopPayBtnDisabledStyle(elem, isReadyToOrder) {
    let readyToOrderPageLoad = helper.isReadyToOrder();

    if (elem) {
        if (isReadyToOrder || readyToOrderPageLoad) {
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
