const { I, data, homePage } = inject();

Then('shopper goes to store locator page', () => {
    I.amOnPage(data.storeLocator.pageURL);
});

Then('shopper searches for a store', () => {
    homePage.searchForStore(data.storeLocator.zipCode);
    homePage.verifyStoreResults(data.storeLocator.numStores);
});

Then('shopper searches for a store with different radius', () => {
    homePage.changeStoreRadius(data.storeLocator.radius);
    homePage.verifyStoreResults(data.storeLocator.numStoresRadius);
});
