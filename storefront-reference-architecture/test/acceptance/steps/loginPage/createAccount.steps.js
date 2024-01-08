const { I, data, loginPage } = inject();

Then('shopper is able to click tab to create account', () => {
    I.click(loginPage.locators.createAccount);
});

Then('shopper is able fill out registration information with new email', () => {
    loginPage.createAccount(data.login.fName, data.login.lName, data.login.phone, data.login.newRegEmail, data.login.password);
});

Then('shopper is able fill out registration information with existing email', () => {
    loginPage.createAccount(data.login.fName, data.login.lName, data.login.phone, data.login.email, data.login.password);
});

Then('shopper is able to click the create account button', () => {
    I.click(locate(loginPage.locators.primaryButton).withText('Create Account'));
    // TODO If you see an error then we'll know it's good, but it's also good if you see a dashboard
});

Then('shopper sees a username is invalid error', () => {
    I.see(data.login.registrationError);
});

Then('shopper does not see a username is invalid error', () => {
    I.dontSee(data.login.registrationError);
});
