const { data, accountPage } = inject();

Then('shopper clicks edit password', () => {
    accountPage.clickEditPassword();
});

Then('shopper changes their password', () => {
    accountPage.changePassword(data.login.password, data.account.newPassword);
});
