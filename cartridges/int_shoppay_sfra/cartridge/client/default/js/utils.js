'use strict';


// Enables & Disables Shop Pay's Buy Now button click based on whether the product is ready to order on the PDP
function shopPayBtnDisabledStyle(elem, isReadyToOrder) {
    let readyToOrderPageLoad = isReadyToOrderOnPageLoad();
    const isPDP = isPDPcontext();

    if (elem) {
        if (isPDP || isReadyToOrder || readyToOrderPageLoad) {
            elem.style.pointerEvents = 'auto'; // DOUBLE CHECK IF WORKS ON MOBILE
        } else {
            elem.style.pointerEvents = 'none';
        }
    }
}

// Checks the context of the page to determine whether the page is checkout, cart or PDP. Returns a boolean of true / false.
function isPDPcontext () {
    let checkoutPage = document.querySelector('#checkout-main');
    let cartPage = document.querySelector('.cart-page');
    let pdpPage = document.querySelector('.product-detail');
    const isPDP = !checkoutPage && !cartPage && pdpPage ? true : false;

    return isPDP;
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

// Checks whether a Buy Now product is ready on page load or not (ex: simple products vs. variants with multiple options to choose from, etc.)
function isReadyToOrderOnPageLoad() {
    let readyToOrder = false;
    let $element = document.querySelector('[data-ready-to-order]');
    if ($element && $element.attributes['data-ready-to-order'] && $element.attributes['data-ready-to-order'].value) {
        readyToOrder = $element.attributes['data-ready-to-order'].value === "true";
    }
    return readyToOrder;
}


module.exports = {
    shopPayBtnDisabledStyle: shopPayBtnDisabledStyle,
    shopPayMutationObserver: shopPayMutationObserver,
    isPDPcontext: isPDPcontext,
    isReadyToOrderOnPageLoad: isReadyToOrderOnPageLoad
};
