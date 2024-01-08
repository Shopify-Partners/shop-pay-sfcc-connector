const { I, homePage } = inject();
var should = require('should'); // eslint-disable-line

Given('shopper lands on the expected content page', () => {
    I.amOnPage('/on/demandware.store/Sites-RefArch-Site/en_US/SourceCodeRedirect-Start?src=privacy3');
    homePage.accept();
});

Then('shopper sees the expected content page', async () => {
    (await I.grabTextFrom('.page-title')).trim().should.equal('Privacy Policy');
});
