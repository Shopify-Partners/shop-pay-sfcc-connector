const I = actor();

var carousel2Item1Selector = '.carousel:nth-child(2) .carousel-item:nth-child(1)';
var prodTile1ComponentSel = carousel2Item1Selector + ' .product-tile-pd';
var carousel2Item3Selector = '.carousel:nth-child(2) .carousel-item:nth-child(3)';
var prodTile3ComponentSel = carousel2Item3Selector + ' .product-tile-pd';

var shopCategoryComponent = '.mobile-1r-1c .shop-category-component';
var shopTheLookCell1 = '.cell1 .shopthelook-figure-lg';
var shopTheLookCell4 = '.cell4 .shopthelook-figure-lg';

module.exports = {
    locators: {
        carouselNext: '.carousel-control-next',
        carouselPrevious: '.carousel-control-prev',

        mainBanner: '.mainbanner-container',
        mainBannerHeading: '.image-heading-text',
        mainBannerSubHeading: '.mainbanner-sub-text',
        mainBannerLink: '.mainbanner-container a',
        pageTitle: '.page-title',

        ITC: '.ITC-container',
        ITCOverlay: '.ITC-image-heading-text',
        ITCImageLink: '.ITC-figure a',

        photo: '.photo-tile-container',

        richText: '.editorialRichText-component-container',
        richTextTitle: '.text-center',

        shopTheLookContainer: '.shop-the-look-container',
        shopTheLookTextOverlay: shopTheLookCell1 + ' .product-text-center',
        shopTheLookImage: '.shopthelook-figure-lg img',
        shopTheLookSetItems: shopTheLookCell1 + ' .set-count-text-center',
        shopTheLookButton: shopTheLookCell1 + ' .shopthelook-text',
        shopTheLook4thImage: shopTheLookCell4 + ' img',
        shopTheLookProductName: shopTheLookCell4 + ' .product-text-center',
        shopTheLook4thSetItems: shopTheLookCell4 + ' .set-count-text-center',
        shopTheLook4thButton: shopTheLookCell4 + ' .shopthelook-text',

        campaignBanner: '.campaign-banner',
        campaignBannerMessage: '.campaign-banner-message',
        campaignBannerCloseButton: '.campaign-banner .close-button .close',

        productTile1: prodTile1ComponentSel,
        productTile1Image: carousel2Item1Selector + ' .product-tile-image .product-tile-component-image',
        productTile1Quickview: prodTile1ComponentSel + ' .quick-shop',
        productTile1ProductName: prodTile1ComponentSel + ' .product-name-link',
        productTile1ProductPrice: prodTile1ComponentSel + ' .product-price .sales',
        productTile3StrikeThroughPrice: prodTile3ComponentSel + ' .product-price .strike-through',
        productTile3ProductPrice: prodTile3ComponentSel + ' .product-price .sales',
        productTile1ImageLinkToPdp: carousel2Item1Selector + ' .product-tile-image a',
        productTile1NameLinkToPdp: prodTile1ComponentSel + ' .product-name-link a',
        productDetailPage: '.product-detail',
        productDetailPageProductId: '.product-id',

        shopCategoryHeading: shopCategoryComponent + ' .shop-category-header h3',
        shopCategoryLabel: shopCategoryComponent + ' .shop-category-label',
        shopCategoryLink1: shopCategoryComponent + ' .shop-category-label:nth-child(1) a',
        shopCategoryLink2: shopCategoryComponent + ' .shop-category-label:nth-child(2) a',
        shopCategoryLink3: shopCategoryComponent + ' .shop-category-label:nth-child(3) a',
        shopCategoryLink4: shopCategoryComponent + ' .shop-category-label:nth-child(4) a',
        shopCategoryLink5: shopCategoryComponent + ' .shop-category-label:nth-child(5) a'
    },
    clickPopulareCategory(index, selector, url) {
        let locator = locate(selector)
            .at(index);

        I.seeElement(locator);
        I.click(locator);
        I.seeInCurrentUrl(url);
    },
    seeCarousel(position) {
        I.seeElement('.carousel:nth-child(' + position + ')');
    },
    controlsVisible(position) {
        I.seeElement('.carousel:nth-child(' + position + ') .carousel-control-next');
        I.seeElement('.carousel:nth-child(' + position + ') .carousel-control-prev');
    },
    verifySlide(position, expectedText, limitingElement) {
        I.seeTextEquals(expectedText, '.carousel:nth-child(' + position + ') .carousel-item.active ' + limitingElement);
    },
    carouselControlClick(position, control) {
        I.click('.carousel:nth-child(' + position + ') ' + control);
        I.wait(1);
    }
};
