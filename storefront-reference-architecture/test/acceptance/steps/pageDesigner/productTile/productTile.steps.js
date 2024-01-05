const { I, data, pageDesigner, utilities } = inject();

Then('shopper should see the product tile component', () => {
    I.seeElement(pageDesigner.locators.productTile1);
});

Then('shopper should see the alt attribute on product image', () => {
    I.seeAttributesOnElements(pageDesigner.locators.productTile1Image, { alt: 'Floral Print Pencil Skirt.' });
});

Then('shopper should see the title attribute on product image', () => {
    I.seeAttributesOnElements(pageDesigner.locators.productTile1Image, { title: 'Floral Print Pencil Skirt., ' });
});

Then('shopper should not see quickview on product tile', () => {
    I.dontSeeElement(pageDesigner.locators.productTile1Quickview);
});

Then('shopper should see the product name on product tile', () => {
    I.see(data.pageDesigner.productTileProductName, pageDesigner.locators.productTile1ProductName);
});

Then('shopper should see the regular price on product tile', () => {
    I.see(data.pageDesigner.productTile1ProductPrice, pageDesigner.locators.productTile1ProductPrice);
});

Then('shopper should see the strike-through price on product tile', () => {
    I.see(data.pageDesigner.productTile3ProductStrikeThroughPrice, pageDesigner.locators.productTile3StrikeThroughPrice);
});

Then('shopper should see the sales price on product tile', () => {
    I.see(data.pageDesigner.productTile3ProductPrice, pageDesigner.locators.productTile3ProductPrice);
});

Then('shopper should go to the product details page clicking on the image', () => {
    utilities.clickToLoadPage(pageDesigner.locators.productTile1ImageLinkToPdp, data.pageDesigner.productTile1PDPLink);
});

Then('shopper should go to the product details page clicking on product name', () => {
    utilities.clickToLoadPage(pageDesigner.locators.productTile1NameLinkToPdp, data.pageDesigner.productTile1PDPLink);
});

