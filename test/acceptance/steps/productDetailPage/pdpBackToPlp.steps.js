const { productPage } = inject();

Then('shopper clicks on the more button', () => {
    productPage.clickMoreButton();
});

Then('Shopper clicks on the first product Tile', () => {
    productPage.clickFirstTile();
});

Then('Shopper clicks the back button on pdp', () => {
    productPage.simulateBackButton();
});
