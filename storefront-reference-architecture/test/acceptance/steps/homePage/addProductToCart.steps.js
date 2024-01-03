const { I, data, homePage, productPage, cartPage, checkoutPage } = inject();
let product;

Given('Shopper searches for {string}', (inputProduct) => {
    product = inputProduct;
    homePage.search(product);
});

When('selects size {string}', (size) => {
    productPage.selectSize(size);
});

When('shopper changes product quantity', () => {
    productPage.selectQuantity(data.product.quantity);
});

When('he adds the product to cart', async () => {
    I.wait(1);
    productPage.addToCart();
});

Then('he is able to see the correct product in cart', () => {
    productPage.viewCart();
    I.see(product, cartPage.locators.lineItemName);
    cartPage.verifyCart(data.product.quantity, data.product.itemPrice, data.product.totalItemPrice,
        data.product.shipping, data.product.tax, data.product.estimatedTotal);
});

When('shopper is able to add and remove a product from minicart', () => {
    homePage.search(data.product4.searchWord);
    productPage.addProductToMiniCart(data.product4);
    cartPage.removeProductFromMiniCart(data.product4);
    I.see(data.product4.afterRemoveQuantity, cartPage.locators.miniCartQuantity);
});

Then('shopper is able to add a product and edit product quantity in minicart', () => {
    homePage.search(data.product4.searchWord);
    productPage.addProductToMiniCart(data.product4);
    cartPage.verifyMiniCartOriginal(data.product4);
    cartPage.editMiniCartQuantity(data.product4);
    cartPage.verifyMiniCartUpdated(data.product4);
});

Then('shopper is able to navigate through minicart, registered checkout pages and remove the product from cart', () => {
    productPage.clickCheckoutBtnOnMiniCart();
    let locator = locate(checkoutPage.locators.checkoutStage).withAttr({ 'data-customer-type': 'registered' });
    I.seeElement(locator);
    checkoutPage.gotoHomePageFromCheckout();
    cartPage.removeProductFromMiniCart(data.product4);
    I.see(data.product4.afterRemoveQuantity, cartPage.locators.miniCartQuantity);
});

Then('shopper goes to Guest Checkout page from minicart', () => {
    productPage.clickCheckoutBtnOnMiniCart();
    I.seeElement(checkoutPage.locators.checkoutAsGuestBtn);
});
