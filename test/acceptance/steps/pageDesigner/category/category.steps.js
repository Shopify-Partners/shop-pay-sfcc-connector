const { I, data, pageDesigner } = inject();

Then('shopper should see the category components', () => {
    I.seeElement('.experience-commerce_assets-category .shop-category-label');
    let el = locate('.experience-commerce_assets-category').at(1);

    I.see(data.pageDesigner.category1, el);
    I.see(data.pageDesigner.category2, el);
    I.see(data.pageDesigner.category3, el);
    I.see(data.pageDesigner.category4, el);
    I.see(data.pageDesigner.category5, el);
});

Then('shopper can click on a category link', () => {
    pageDesigner.clickPopulareCategory(1, '.shop-category-label', data.pageDesigner.categoryLink);
});
