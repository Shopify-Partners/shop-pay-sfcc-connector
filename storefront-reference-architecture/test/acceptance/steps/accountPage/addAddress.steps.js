const { data, accountPage } = inject();

Then('shopper clicks add new address', () => {
    accountPage.clickAddAddress();
});

Then('shopper fills out address information', () => {
    accountPage.addAddress(data.account.addressTitle, data.checkout.fName, data.checkout.lName, data.checkout.address1,
        data.checkout.country, data.checkout.state, data.checkout.city, data.checkout.zip, data.login.phone);
});
