const { I, data, homePage } = inject();

Then('shopper enters email in signup form', () => {
    I.scrollPageToBottom();
    homePage.subscribeList(data.home.email);
});

Then('shopper subscribes to the email list', () => {
    I.click(homePage.locators.subscribeButton);
    I.waitForElement(homePage.locators.emailSignup);
    I.see('Email Signup successful');
});
