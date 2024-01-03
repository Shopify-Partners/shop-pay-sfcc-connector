const { I, utilities } = inject();

When('shopper load Page Designer home page', () => {
    I.amOnPage('/s/RefArch/homepage-example.html?lang=default');
});

When('shopper load Page Designer campaign page', () => {
    I.amOnPage('/s/RefArch/campaign-example.html?lang=default');
});

When('shopper accept the Consent Tracking Modal', () => {
    utilities.accept();
});
