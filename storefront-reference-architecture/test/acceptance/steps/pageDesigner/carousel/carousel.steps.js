const { data, pageDesigner } = inject();

When('Shopper sees the carousel {string}', (position) => {
    var carouselPosition = position;
    pageDesigner.seeCarousel(carouselPosition);
});

Given('Shopper sees carousel controls in carousel {string}', (position) => {
    var carouselPosition = position;
    pageDesigner.controlsVisible(carouselPosition);
});

Then('Shopper should see the next slide in the first carousel', () => {
    pageDesigner.verifySlide(1, data.pageDesigner.mainBannerHeading2, pageDesigner.locators.mainBannerHeading);
});

When('Shopper clicks previous in carousel {string}', (position) => {
    var carouselPosition = position;
    pageDesigner.carouselControlClick(carouselPosition, pageDesigner.locators.carouselPrevious);
});

Then('Shopper should see the previous slide in the first carousel', () => {
    pageDesigner.verifySlide(1, data.pageDesigner.mainBannerHeading, pageDesigner.locators.mainBannerHeading);
});

When('Shopper clicks next in carousel {string} {int} time(s)', (position, clicks) => {
    var carouselPosition = position;
    var carouselClicks = clicks;
    for (var i = 0; i < carouselClicks; i++) {
        pageDesigner.carouselControlClick(carouselPosition, pageDesigner.locators.carouselNext);
    }
});

Then('Shopper should see next product in the second carousel', () => {
    pageDesigner.verifySlide(2, data.pageDesigner.productTileProductName, '.product-name-link');
});

Then('Shopper should see previous slide in the second carousel', () => {
    pageDesigner.verifySlide(2, data.pageDesigner.productTileProductName5, '.product-name-link');
});
