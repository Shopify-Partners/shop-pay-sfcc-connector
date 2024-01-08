const { I, pageDesigner } = inject();

Then('shopper should see the popularCategories layout', () => {
    I.waitForElement('.popular-categories');
    I.seeElement('.popular-categories .popular-cat-heading');
    I.see('Popular Catalogs', '.popular-cat-heading h3');
    I.seeElement('.popular-categories .popular-category');
});

Then('shopper should see the popularCategory components', () => {
    I.seeNumberOfElements('.popular-category', 6);
    let el = locate('.popular-cat-link').at(1);
    I.see('Outfits', el);
    I.see('Tops', el);
    I.see('Dresses', el);
    I.see('Bottoms', el);
    I.see('Jackets & Coats', el);
    I.see('Feeling Red', el);
});


Then('shopper can click on a popular category', () => {
    pageDesigner.clickPopulareCategory(1, '.popular-category', '/s/RefArch/new arrivals/womens/?lang=default');
});

