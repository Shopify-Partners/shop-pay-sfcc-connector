const { data, accountPage } = inject();

Then('shopper clicks edit profile', () => {
    accountPage.clickEditProfile();
});

Then('shopper edits phone number', () => {
    accountPage.editProfile(data.login.phone, data.login.email, data.login.password);
});
