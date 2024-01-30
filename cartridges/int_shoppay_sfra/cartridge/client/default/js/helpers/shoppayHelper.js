/**
 * Add csrf token param to url
 * @param {string} url - source url
 * @param {string} basketId - UUID of the temporary basket in the session, if applicable
 * @returns {string} - url with csrf_token param
 */
function getUrlWithCsrfToken(url, basketId) {
    const urlInstance = new URL(url, location.origin);

    urlInstance.searchParams.append('csrf_token', getCsrfToken());
    if (basketId) {
        urlInstance.searchParams.append('basketId', basketId);
    }

    return urlInstance.toString();
}

/**
 * Get CSRF Token
 * @returns {string} - csrf token value
 */
function getCsrfToken() {
    let $element = document.querySelector('[data-csrf-token]');

    if ($element && $element.attributes['data-csrf-token'] && $element.attributes['data-csrf-token'].value) {
        return $element.attributes['data-csrf-token'].value;
    }

    return '';
}

function isReadyToOrder() {
    let readyToOrder = false;
    let $element = document.querySelector('[data-ready-to-order]');
    if ($element && $element.attributes['data-ready-to-order'] && $element.attributes['data-ready-to-order'].value) {
        readyToOrder = $element.attributes['data-ready-to-order'].value === "true";
    }
    return readyToOrder;
}

function getInitProductData() {
    let productData = null;
    let $element = document.querySelector('[data-buy-now-init]');
    if ($element && $element.attributes['data-buy-now-init'] && $element.attributes['data-buy-now-init'].value) {
        productData = JSON.parse($element.attributes['data-buy-now-init'].value);
    }
    return productData;
}

export {
    getCsrfToken,
    getUrlWithCsrfToken,
    isReadyToOrder,
    getInitProductData
};
