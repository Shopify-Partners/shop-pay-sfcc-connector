const { I, data, loginPage } = inject();

When('shopper clicks forgot password', () => {
    I.waitForElement(loginPage.locators.forgotPassword);
    I.click(loginPage.locators.forgotPassword);
});

When('shopper fills out their recovery email address', () => {
    loginPage.forgotPassword(data.home.email);
});

Then('shopper should see request to change password prompt', () => {
    loginPage.verifyPasswordReset();
});
