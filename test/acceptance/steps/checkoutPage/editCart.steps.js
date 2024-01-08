const { cartPage, productPage, data } = inject();

Then('shopper edits products in cart', () => {
    productPage.viewCart();
    cartPage.verifyCartQuantity(+data.product.quantity + +data.product2.quantity);
    cartPage.removeProduct(data.product2.name);
    cartPage.verifyCart(data.product.quantity, data.product.itemPrice, data.product.totalItemPrice,
        data.product.shipping, data.product.tax, data.product.estimatedTotal);
    cartPage.editQuantity(data.product.editCartQuantity);
});
