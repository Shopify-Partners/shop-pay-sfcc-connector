const I = actor();

module.exports = {
    locators: {
        consentTrackModal: '.modal-content',
        consentTrackAffirm: '.affirm.btn.btn-primary',
        searchField: 'input.form-control.search-field',
        searchedImage: 'a>img.swatch-circle',
        loginButton: '.user-message',
        subscribeEmail: 'input.form-control',
        subscribeButton: '.subscribe-email',
        emailSignup: '.email-signup-alert',
        searchWomens: '#womens.nav-link.dropdown-toggle',
        searchWomensClothing: '#womens-clothing.dropdown-link.dropdown-toggle',
        searchWomensTops: '#womens-clothing-tops.dropdown-link',
        searchStoreZipCode: '#store-postal-code',
        searchStoreBtn: '.btn-storelocator-search',
        searchStoreResults: '.results.striped',
        searchStoreCard: '.card-body',
        searchStoreRadius: '.form-control.custom-select.radius'
    },
    accept() {
        within(this.locators.consentTrackModal, () => {
            I.click(this.locators.consentTrackAffirm);
        });
    },
    search(product) {
        I.fillField(this.locators.searchField, product);
        I.waitForElement(this.locators.searchedImage);
        I.click(this.locators.searchedImage);
    },
    subscribeList(email) {
        I.fillField('hpEmailSignUp', email);
    },
    searchMenu(productPage) {
        I.amOnPage(productPage);
    },
    searchForStore(zip) {
        I.fillField(this.locators.searchStoreZipCode, zip);
        I.click(this.locators.searchStoreBtn);
    },
    verifyStoreResults(numStores) {
        let locator = locate(this.locators.searchStoreCard)
            .inside(this.locators.searchStoreResults);
        I.seeNumberOfVisibleElements(locator, numStores);
    },
    changeStoreRadius(radius) {
        I.selectOption(this.locators.searchStoreRadius, radius);
    }
};
