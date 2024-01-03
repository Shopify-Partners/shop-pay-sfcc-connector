const { I, data, homePage, loginPage } = inject();

// For going to the login landing page
Given('shopper goes to the Login Page', () => {
    I.amOnPage(data.login.homePage);
    homePage.accept();
    I.amOnPage(data.login.loginPage);
});

// For going to the login landing page and signing in
Then('shopper logs into the website', () => {
    I.amOnPage(data.login.homePage);
    homePage.accept();
    I.amOnPage(data.login.loginPage);
    loginPage.login(data.login.email, data.login.password);
});

Given('shopper logs into the website on phone', () => {
    I.amOnPage(data.login.homePage);
    homePage.accept();

    I.seeElement(loginPage.locators.hamburgerLogin);
    I.click(loginPage.locators.hamburgerLogin);

    let locator = locate(loginPage.locators.loginBtn)
      .withChild(loginPage.locators.loginBtnLink);
    I.waitForElement(locator);
    I.click(locator);

    loginPage.login(data.login.email, data.login.password);
});

Given('shopper logs into the website on tablet', () => {
    I.amOnPage(data.login.homePage);
    homePage.accept();

    let locator = locate(loginPage.locators.loginBtn)
      .withChild(loginPage.locators.loginBtnLink);
    I.waitForElement(locator);
    I.click(locator);

    loginPage.login(data.login.email, data.login.password);
});
