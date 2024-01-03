const I = actor();

module.exports = {
    locators: {
        button: 'button',
        selectSize: '.select-size',
        selectQuantity: '.quantity-select',
        selectColor: '.color-attribute',
        addToCartButton: '.add-to-cart',
        addToCartButtonEnabled: '.add-to-cart:not(:disabled)',
        miniCartIcon: '.minicart-icon.fa.fa-shopping-bag',
        miniCartCheckoutButton: '.checkout-btn',
        cartHeader: '.cart-header',
        productImage: '.carousel-item.active > img',
        navigationCrumbs: '.product-breadcrumb:not(.d-md-none) .breadcrumb-item a',
        productName: '.product-name',
        productId: '.product-id',
        ratings: '.ratings',
        productAvailability: '.availability-msg',
        productPrice: '.prices .price .value',
        socialShare: 'ul.social-icons a',
        pinterest: '.fa-pinterest',
        facebook: '.fa-facebook-official',
        twitter: '.fa-twitter',
        copyLink: '.fa-link',
        productDescription: '.description-and-detail .description .content',
        productDetails: '.description-and-detail .details .content',
        copyLinkMsgVisible: '.copy-link-message:not(.d-none)',
        addToCartSuccess: '.add-to-cart-messages .alert-success',
        addToCartFailure: '.add-to-cart-messages .alert-danger',
        filterColor: '.swatch-circle-',
        filterSize: 'span.null',
        filterPrice: 'span',
        filterOption: '.custom-select',
        filterPDP: '.pdp-link a.link',
        productTotals: '.result-count.text-center',
        qv_ProductBtn: '.quickview.hidden-sm-down',
        qv_ColorBtn: '.color-attribute',
        qv_SizeSelect: '.custom-select.form-control.select-size',
        qv_AddToCart: '.add-to-cart-global.btn.btn-primary',
        alertAddToCart: '.alert.alert-success.add-to-basket-alert',
        moreButton: '.show-more .more',
        firstProductTile: '.product-tile',
        pdpClass: '.product-detail'
    },
    selectSize(size) {
        I.waitForElement(this.locators.selectSize);
        I.selectOption(this.locators.selectSize, size);
    },
    selectQuantity(quantity) {
        I.waitForElement(this.locators.selectQuantity);
        I.selectOption(this.locators.selectQuantity, quantity);
    },
    selectColor(color) {
        let locator = locate(this.locators.selectColor)
            .withAttr({ 'aria-label': 'Select Color ' + color });
        I.waitForElement(locator);
        I.click(locator);
    },
    addToCart() {
        I.waitForEnabled(this.locators.addToCartButton);
        I.click(this.locators.addToCartButton);
    },
    addProductToMiniCart(product) {
        this.selectSize(product.size);
        this.selectColor(product.color);
        this.selectQuantity(product.originalQuantity);
        this.addToCart();
    },
    viewCart() {
        I.click(this.locators.miniCartIcon);
        I.waitForElement(this.locators.cartHeader);
    },
    clickCopyLink() {
        I.waitForEnabled(this.locators.copyLink);
        I.click(this.locators.copyLink);
    },
    filterProductColor(color) {
        I.waitForElement(this.locators.filterColor + color);
        I.click(this.locators.filterColor + color);
    },
    filterProductSize(filterSizeTotal) {
        let locator = locate(this.locators.filterSize)
            .withAttr({ 'aria-hidden': 'true' })
            .withText(filterSizeTotal);
        I.waitForElement(locator);
        I.click(locator);
    },
    filterProductPrice(filterPriceTotal) {
        let locator = locate(this.locators.filterPrice)
            .withAttr({ 'aria-hidden': 'true' })
            .withText(filterPriceTotal);
        I.waitForElement(locator);
        I.click(locator);
    },
    filterProductOption(filterOption, firstProductName) {
        let locatorOption = locate(this.locators.filterOption)
            .withAttr({ 'aria-label': 'Sort By' });
        I.waitForElement(locatorOption);
        I.scrollTo(locatorOption);
        I.selectOption(locatorOption, filterOption);
        I.wait(1.5);

        let locatorProduct = locate(this.locators.filterPDP).first();
        I.waitForElement(locatorProduct);
        I.see(firstProductName, locatorProduct);
    },
    clickMoreButton() {
        I.click(this.locators.moreButton);
        I.wait(1.5);
    },
    clickFirstTile() {
        I.click(this.locators.firstProductTile)[0]; // eslint-disable-line no-unused-expressions
    },
    simulateBackButton() {
        I.wait(1.5);
        I.waitForElement(this.locators.pdpClass);
        I.executeScript('window.history.back();');
        I.wait(1.5);
        I.waitNumberOfVisibleElements(this.locators.firstProductTile, 24);
    },
    verifyProductTotals(totalItems) {
        let locator = locate(this.locators.productTotals)
            .find(this.locators.filterPrice);
        I.waitForElement(locator);
        I.see(totalItems, locator);
    },
    openProductQuickView(pdpQuickViewLink) {
        let locator = locate(this.locators.qv_ProductBtn)
            .withAttr({ href: pdpQuickViewLink });
        I.waitForElement(locator);
        I.scrollTo(locator);
        I.click(locator);
    },
    selectQuickViewColor(color) {
        let locator = locate(this.locators.qv_ColorBtn)
            .withAttr({ 'aria-label': 'Select Color ' + color });
        I.waitForElement(locator);
        I.click(locator);
    },
    selectQuickViewSize(size) {
        I.waitForElement(this.locators.qv_SizeSelect);
        I.selectOption(this.locators.qv_SizeSelect, size);
    },
    addToCartQuickView() {
        I.waitForElement(this.locators.qv_AddToCart);
        I.click(this.locators.qv_AddToCart);
    },
    clickCheckoutBtnOnMiniCart() {
        I.waitForElement(this.locators.miniCartCheckoutButton);
        I.click(this.locators.miniCartCheckoutButton);
    }
};
