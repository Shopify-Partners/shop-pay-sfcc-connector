const { I, data, cartPage, checkoutPage, accountPage, loginPage } = inject();

var orderHistoryNumber = '';

Then('shopper goes to cart', () => {
    I.waitForElement(cartPage.locators.cartIcon);
    I.click(cartPage.locators.cartIcon);
});

Then('shopper changes product quantity to {string}', (quantity) => {
    cartPage.editQuantity(quantity);
});

Then('shopper selects checkout from cart', () => {
    I.waitForElement(cartPage.locators.checkoutBtn);
    I.click(cartPage.locators.checkoutBtn);
});

Then('shopper selects checkout as guest', () => {
    I.waitForElement(checkoutPage.locators.checkoutAsGuestBtn);
    checkoutPage.fillPersonalDataGuest(data.checkout.email);
    I.click(checkoutPage.locators.checkoutAsGuestBtn);
});

Then('shopper fills out shipping information', () => {
    checkoutPage.fillShippingInfo(data.checkout.fName, data.checkout.lName, data.checkout.address1,
        data.checkout.country, data.checkout.state, data.checkout.city,
        data.checkout.zip, data.checkout.phone);
});

Then('shopper verifies shipping information', () => {
    checkoutPage.verifyShipping(data.checkout.fName, data.checkout.lName, data.checkout.address1,
        data.checkout.city, data.checkout.stateAbr, data.checkout.zip);
});

Then('shopper proceeds to payment section', () => {
    I.waitForElement(checkoutPage.locators.toPayment);
    I.click(checkoutPage.locators.toPayment);
});

Then('shopper fills out billing information', () => {
    checkoutPage.fillPaymentInfoGuest(data.user1.fName, data.user1.lName, data.user1.address1,
        data.user1.city, data.user1.stateAbr, data.user1.zip, data.checkout.phone, data.checkout.ccNum,
        data.checkout.expMonth, data.checkout.expYear, data.checkout.ccSecCode);
});

Then('shopper fills out registered user billing information', () => {
    checkoutPage.fillPaymentInfoRegistered(data.checkout.phone, data.checkout.ccSecCode);
});

Then('shopper places order', () => {
    I.waitForElement(checkoutPage.locators.placeOrder);
    I.click(checkoutPage.locators.placeOrder);
    checkoutPage.verifyCheckoutInfo(data.checkout.fName, data.checkout.lName, data.checkout.address1,
        data.checkout.city, data.checkout.zip, data.checkout.phone, data.checkout.ccNum, data.checkout.ccExpDate, data.product.quantity,
        data.product.totalItemPrice, data.product.shipping, data.product.tax, data.product.estimatedTotal);
    I.waitForElement(checkoutPage.locators.confirmOrder);
    I.click(checkoutPage.locators.confirmOrder);
});

Then('shopper verifies the order confirmation page', async () => {
    checkoutPage.verifyOrderConfirmation(data.checkout.fName, data.checkout.lName, data.checkout.address1,
        data.checkout.city, data.checkout.zip, data.checkout.phone,
        data.checkout.email, data.checkout.ccNum, data.checkout.ccExpDate, data.product.quantity,
        data.product.totalItemPrice, data.product.shipping, data.product.tax, data.product.estimatedTotal);
    orderHistoryNumber = await I.grabTextFrom('.summary-details.order-number');
});

Then('shopper goes to profile saved payments page and deletes credit card', () => {
    I.amOnPage(data.account.accountPage);
    accountPage.viewAllPayments();
    accountPage.removePayment(data.account.deletePaymentModalText);
});

Then('logs out of the account', () => {
    accountPage.logOut();
});

Then('shopper is able to fill out the order number, email, and zip code', () => {
    loginPage.checkOrder(orderHistoryNumber, data.orderHistory.email, data.orderHistory.zip);
});

Then('shopper is able to click the check status button', () => {
    I.waitForElement(loginPage.locators.primaryButton);
    I.click(locate(loginPage.locators.primaryButton).withText('Check status'));
});

Then('shopper is able to view order detail', () => {
    loginPage.verifyOrderHistory(data.product);
});
