const { I, homePage, productPage } = inject();
var should = require('should'); // eslint-disable-line

Given('shopper lands on the expected pdp', () => {
    I.amOnPage('/on/demandware.store/Sites-RefArch-Site/en_US/SourceCodeRedirect-Start?src=ps3bundle5');
    homePage.accept();
});

Then('shopper sees all the product related information v2', async () => {
    (await I.grabTextFrom(productPage.locators.productName))[0].trim().should.equal('Playstation 3 Bundle');
});
