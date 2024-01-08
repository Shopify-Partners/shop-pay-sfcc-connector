const { data, accountPage } = inject();

Then('shopper clicks add new payment', () => {
    accountPage.clickAddPayment();
});

Then('shopper fills out their payment information', () => {
    accountPage.addPayment(data.account.name, data.checkout.ccNum, data.checkout.expMonth, data.checkout.expYear);
});

Then('shopper clicks view payments', () => {
    accountPage.viewAllPayments();
});

Then('shopper removes a saved credit card', () => {
    accountPage.removePayment(data.account.deletePaymentModalText);
});
