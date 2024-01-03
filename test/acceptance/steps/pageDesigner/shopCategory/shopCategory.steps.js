const { I, data, pageDesigner, utilities } = inject();

Then('shopper should see the shop category heading', () => {
    I.see(data.pageDesigner.shopCategoryTitle, pageDesigner.locators.shopCategoryHeading);
});

Then('shopper should see 5 shop categories', () => {
    I.seeNumberOfElements(pageDesigner.locators.shopCategoryLabel, 5);
    I.see(data.pageDesigner.shopCategory1, pageDesigner.locators.shopCategoryLink1);
    I.see(data.pageDesigner.shopCategory2, pageDesigner.locators.shopCategoryLink2);
    I.see(data.pageDesigner.shopCategory3, pageDesigner.locators.shopCategoryLink3);
    I.see(data.pageDesigner.shopCategory4, pageDesigner.locators.shopCategoryLink4);
    I.see(data.pageDesigner.shopCategory5, pageDesigner.locators.shopCategoryLink5);
});

Then('shopper should go to the category page by clicking on the category link', () => {
    utilities.clickToLoadPage(pageDesigner.locators.shopCategoryLink3, data.pageDesigner.shopCategoryLink);
});
