const { I, productPage, cartPage, data } = inject();

Then('shopper opens product quick view from home page', () => {
    productPage.openProductQuickView(data.product3.productLinkQV);
});

Then('shopper adds to cart from Quick View', () => {
    productPage.addToCartQuickView();
    I.waitForVisible(productPage.locators.alertAddToCart);
    productPage.viewCart();
    cartPage.verifyCartQuantity(data.product3.quantity);
});
