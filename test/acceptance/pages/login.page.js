const I = actor();

module.exports = {
    locators: {
        loginHomeScreen: 'span.user-message',
        emailLogin: '#login-form-email',
        passwordLogin: '#login-form-password',
        primaryButton: '.btn.btn-block.btn-primary',
        rememberMe: '.remember-me',
        createAccount: '#register-tab',
        firstName: '#registration-form-fname',
        lastName: '#registration-form-lname',
        phoneNum: '#registration-form-phone',
        emailAdr: '#registration-form-email',
        emailAdrConfirm: '#registration-form-email-confirm',
        password: '#registration-form-password',
        passwordConfirm: '#registration-form-password-confirm',
        orderNumber: '#trackorder-form-number',
        orderEmail: '#trackorder-form-email',
        orderZipCode: '#trackorder-form-zip',
        orderReceipt: '.card-body.order-total-summary',
        forgotPassword: '#password-reset',
        forgotPasswordForm: '#reset-password-email',
        submitEmailBtn: '#submitEmailButton',
        verifyPasswordModal: '.modal-content',
        hamburgerLogin: '.navbar-toggler.d-md-none',
        loginBtn: '.nav-item.d-lg-none',
        loginBtnLink: 'a.nav-link'
    },
    login(email, password) {
        // fill login form
        I.waitForElement(this.locators.emailLogin);
        I.waitForElement(this.locators.passwordLogin);
        I.fillField(this.locators.emailLogin, email);
        I.fillField(this.locators.passwordLogin, password);

        // click login
        I.waitForElement(this.locators.primaryButton);
        I.click(this.locators.primaryButton);
    },
    createAccount(fName, lName, phone, email, password) {
        I.fillField(this.locators.firstName, fName);
        I.fillField(this.locators.lastName, lName);
        I.fillField(this.locators.phoneNum, phone);
        I.fillField(this.locators.emailAdr, email);
        I.fillField(this.locators.emailAdrConfirm, email);
        I.fillField(this.locators.password, password);
        I.fillField(this.locators.passwordConfirm, password);
    },
    checkOrder(orderNum, orderEmail, billingZip) {
        I.fillField(this.locators.orderNumber, orderNum);
        I.fillField(this.locators.orderEmail, orderEmail);
        I.fillField(this.locators.orderZipCode, billingZip);
    },
    verifyOrderHistory(product) {
        I.see(product.totalItemPrice, this.locators.orderReceipt);
        I.see(product.shipping, this.locators.orderReceipt);
        I.see(product.tax, this.locators.orderReceipt);
        I.see(product.estimatedTotal, this.locators.orderReceipt);
    },
    forgotPassword(email) {
        I.wait(2); // Must wait because of modal fade chops the email param off randomly and fails the test
        let locator = locate(this.locators.forgotPasswordForm)
            .withAttr({ name: 'loginEmail' });
        I.waitForElement(locator);
        I.fillField(locator, email);
    },
    verifyPasswordReset() {
        I.waitForElement(this.locators.submitEmailBtn);
        I.click(this.locators.submitEmailBtn);
        I.waitForElement(this.locators.verifyPasswordModal);
        I.see('Request to Reset Your Password', this.locators.verifyPasswordModal);
        I.waitForElement(this.locators.submitEmailBtn);
        I.click(this.locators.submitEmailBtn);
    }
};
