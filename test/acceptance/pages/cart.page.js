const I = actor();

module.exports = {
    locators: {
        lineItemQuantity: '.form-control.quantity.custom-select',
        totalItemQuantity: 'h2.number-of-items',
        lineItemPriceTotal: 'span.value',
        totalItemPrice: '.line-item-total-price',
        shippingCost: '.text-right.shipping-cost',
        taxTotal: '.text-right.tax-total',
        estimatedTotal: '.text-right.grand-total',
        cartIcon: '.minicart-icon.fa.fa-shopping-bag',
        checkoutBtn: '.btn.btn-primary.btn-block.checkout-btn',
        removeProductBox: '.hidden-md-down',
        removeProductBtn: '.remove-btn-lg.remove-product.btn.btn-light',
        removeProductModal: '.modal-content',
        removeProductModalConfirm: '.btn.btn-primary.cart-delete-confirmation-btn',
        editQuantitySelector: '.form-control.quantity.custom-select',
        miniCartEditQty: 'select[data-pid="<pid>"]',
        lineItemName: '.line-item-name',
        miniCartLineItemName: '.line-item-name > span',
        lineItemAttributes: '.item-attributes .line-item-attributes',
        subTotal: '.text-right.sub-total',
        removeProductButton: '.remove-btn.remove-product',
        removeFromMiniCartButton: 'button[data-pid="<pid>"]',
        miniCartQuantity: '.minicart-quantity',
        miniCartPopover: '.popover.popover-bottom.show'
    },
    verifyCart(totalQuantity, itemPrice, totalItemPrice, shipping, tax, estimatedTotal) {
        I.see(totalQuantity, this.locators.lineItemQuantity);
        I.see(itemPrice, this.locators.lineItemPriceTotal);
        I.see(totalItemPrice, this.locators.totalItemPrice);
        I.see(shipping, this.locators.shippingCost);
        I.see(tax, this.locators.taxTotal);
        I.see(estimatedTotal, this.locators.estimatedTotal);
    },
    verifyCartQuantity(totalQuantity) {
        I.see(totalQuantity + ' Items', this.locators.totalItemQuantity);
    },
    verifyMiniCartOriginal(product) {
        I.scrollPageToTop();
        I.executeScript(function (el) { $(el).trigger('touchstart'); }, this.locators.cartIcon);
        this.verifyMiniCart(product);
        I.see(product.originalQuantity, this.locators.lineItemQuantity);
        I.see(product.originalPrice, this.locators.subTotal);
    },
    verifyMiniCartUpdated(product) {
        this.verifyMiniCart(product);
        I.see(product.finalQuantity, this.locators.lineItemQuantity);
        I.see(product.finalPrice, this.locators.subTotal);
    },
    verifyMiniCart(product) {
        I.see(product.name, this.locators.miniCartLineItemName);
        I.see(product.colorAttribute, this.locators.lineItemAttributes);
        I.see(product.sizeAttribute, this.locators.lineItemAttributes);
        I.see(product.availability, this.locators.lineItemAttributes);
    },
    removeProductFromMiniCart(product) {
        I.scrollPageToTop();
        I.executeScript(function (el) { $(el).trigger('touchstart'); }, this.locators.cartIcon);
        I.click(this.locators.removeFromMiniCartButton.replace('<pid>', product.pid));
        // Confirm remove product
        within(this.locators.removeProductModal, () => {
            I.click(this.locators.removeProductModalConfirm);
        });
    },
    removeProduct(productName) {
        // Click x to remove product
        let locator = locate(this.locators.removeProductBox)
            .find(this.locators.removeProductBtn)
            .withAttr({ 'data-name': productName });
        I.click(locator);
        // Confirm remove product
        within(this.locators.removeProductModal, () => {
            I.click(this.locators.removeProductModalConfirm);
        });
    },
    editQuantity(quantity) {
        I.selectOption(this.locators.editQuantitySelector, quantity);
    },
    editMiniCartQuantity(product) {
        within(this.locators.miniCartPopover, () => {
            I.selectOption(this.locators.miniCartEditQty.replace('<pid>', product.pid), product.editQuantity);
        });
    }
};
