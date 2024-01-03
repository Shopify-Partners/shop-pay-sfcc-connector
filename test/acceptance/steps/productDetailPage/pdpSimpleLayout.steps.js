const { I, homePage, productPage } = inject();
var should = require('should'); // eslint-disable-line

Given('shopper goes to the Product Detail Page', () => {
    I.amOnPage('/on/demandware.store/Sites-RefArch-Site/en_US/Product-Show?pid=P0150M');
    homePage.accept();
});

Then('shopper sees all the product related information', async () => {
    (await I.grabAttributeFrom(productPage.locators.productImage, 'src'))[0].trim().should.containEql('P0150_001.jpg');
    (await I.grabTextFrom(productPage.locators.productName))[0].trim().should.equal('Upright Case (33L - 3.7Kg)');
    (await I.grabTextFrom(productPage.locators.productId)).trim().should.equal('P0150M');
    (await I.grabTextFrom(productPage.locators.productAvailability)).trim().should.equal('In Stock');
    (await I.grabTextFrom(productPage.locators.productPrice)).trim().should.equal('$99.99');
    (await I.grabTextFrom(productPage.locators.productDescription)).trim().should.equal('This practical and functional case is perfect for business – with no need to check in as luggage due to its cabin size dimensions – or for any convenient no-fuss travel any time any where. You can pull along for comfort or carry by the handle, and with plenty of space inside and a large front pocket with additional zippered pocket, there’s plenty of useful and compact storage.');
    (await I.grabTextFrom(productPage.locators.productDetails)).trim().should.equal('1682 ballistic nylon and genuine leather inserts |Pull-out metallic handle for wheeling|Top and side handles|Cabin size for convenient travelling|TSA lock for security');
});

Then('shopper sees the correct breadcrumbs', async () => {
    const breadcrumbsHrefs = await I.grabAttributeFrom(productPage.locators.navigationCrumbs, 'href');
    breadcrumbsHrefs[0].should.containEql('mens'); // Mens Category
    breadcrumbsHrefs[1].should.containEql('accessories'); // Accessories Category
    breadcrumbsHrefs[2].should.containEql('luggage'); // Luggage Category
});

Then('shopper sees the correct social links', async () => {
    I.seeElement(productPage.locators.pinterest); // Pinterest
    I.seeElement(productPage.locators.facebook); // Facebook
    I.seeElement(productPage.locators.twitter); // Twitter
    I.seeElement(productPage.locators.copyLink); // Copy Link
    const socialHrefs = await I.grabAttributeFrom(productPage.locators.socialShare, 'href');
    socialHrefs[0].should.containEql('pinterest.com'); // Pinterest href
    socialHrefs[1].should.containEql('facebook.com'); // Facebook href
    socialHrefs[2].should.containEql('twitter.com'); // Twitter href
    socialHrefs[3].should.containEql('copy-link-message'); // Copy Link href
});

Then('shopper is able to see Add to Cart Button Enabled', () => {
    I.seeElement(productPage.locators.addToCartButtonEnabled);
});

Then('shopper is able to copy Product URL using Copy Link Icon', () => {
    productPage.clickCopyLink();
    I.seeElement(productPage.locators.copyLinkMsgVisible);
});
