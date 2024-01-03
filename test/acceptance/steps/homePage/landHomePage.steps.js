const { I, data, homePage } = inject();

When('shopper selects yes or no for tracking consent', () => {
    I.amOnPage(data.login.homePage);
    homePage.accept();
});
