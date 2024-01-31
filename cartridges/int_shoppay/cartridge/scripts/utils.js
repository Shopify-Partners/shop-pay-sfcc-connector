'use strict';

// TODO: Awaiting feedback from shoppay team on how to disable button (Note: team may provide special method to disable button & elminiate need for this function).
// Applies / Removes 'disabled' styling to the button based on whether the basket is empty or not
function shopPayBtnDisabledStyle(elem, emptyCart) {
    if (elem) {
        if (emptyCart) {
            elem.style.opacity = '0.5'; // 50% opacity (Note: this is the 'disabled' style)
            elem.style.pointerEvents = 'none';
        } else {
            elem.style.opacity = '1'; // restore opacity to a normal view
            elem.style.pointerEvents = 'auto';
        }
    }
}


// Watches for when ShopPay button is first rendered to the page to then apply correct button styling depending on whether the basket is empty or not
function shopPayMutationObserver(elemSelector, emptyCart) {
    const observer = new MutationObserver((mutationsList, observer) => {
        const renderedShopPayElem = document.querySelector(elemSelector);
        if (renderedShopPayElem) {
            shopPayBtnDisabledStyle(renderedShopPayElem, emptyCart);
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}


module.exports = {
    shopPayBtnDisabledStyle: shopPayBtnDisabledStyle,
    shopPayMutationObserver: shopPayMutationObserver
};
