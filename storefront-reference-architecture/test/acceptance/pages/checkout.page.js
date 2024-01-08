const I = actor();

module.exports = {
    locators: {
        lineItemName: 'div.line-item-name',
        checkoutAsGuestBtn: '.btn.btn-primary.btn-block.submit-customer',
        checkoutAsRegisteredBtn: '.btn.btn-block.btn-primary',
        emailGuest: '#email-guest',
        emailRegistered: '#email',
        password: '#login-form-password',
        fName: '.form-control.shippingFirstName',
        lName: '.form-control.shippingLastName',
        address1: '.form-control.shippingAddressOne',
        country: '.form-control.shippingCountry',
        state: '.form-control.shippingState',
        city: '.form-control.shippingAddressCity',
        zip: '.form-control.shippingZipCode',
        phone: '.form-control.shippingPhoneNumber',
        toPayment: '.btn.btn-primary.btn-block.submit-shipping',
        payPhone: '#phoneNumber',
        payCard: '#cardNumber',
        payExpMonth: '#expirationMonth',
        payExpYear: '#expirationYear',
        paySecCode: '#securityCode',
        paySecCodeSaved: '.form-control.saved-payment-security-code',
        placeOrder: '.btn.btn-primary.btn-block.submit-payment',
        confirmOrder: '.btn.btn-primary.btn-block.place-order',
        billingConfirmation: '.addressSelector.form-control',
        shipping_addSelector: '.addressSelector',
        shipping_methodBlock: '.shipping-method-block',
        shipping_methodOptions: '.form-check.col-9.start-lines',
        checkout_shippingSection: '.card.shipping-summary',
        checkout_prefilledShippingInfo: '.addressSelector.form-control',
        checkout_paymentSection: '.card.payment-summary',
        checkout_orderSummary: '.card-body.order-total-summary',

        orderConf_thankYou: '.order-thank-you-msg',
        orderConf_shippingSection: '.summary-details.shipping',
        orderConf_billingSection: '.summary-details.billing',
        orderConf_paymentSection: '.payment-details',
        orderConf_quantity: '.line-item-pricing-info',
        orderConf_totalSection: '.order-total-summary',
        orderConf_orderNumber: 'summary-details.order-number',
        homeLink: 'a>img.hidden-md-down',
        checkoutStage: '.data-checkout-stage'
    },
    fillPersonalDataGuest(email) {
        I.fillField(this.locators.emailGuest, email);
    },
    fillShippingInfo(fName, lName, address1, country, state, city, zipcode, phone) {
        I.scrollTo(this.locators.fName);
        I.fillField(this.locators.fName, fName);
        I.fillField(this.locators.lName, lName);
        I.fillField(this.locators.address1, address1);
        I.waitForElement(this.locators.country);
        I.selectOption(this.locators.country, country);
        I.waitForElement(this.locators.state);
        I.selectOption(this.locators.state, state);
        I.wait(3);
        I.fillField(this.locators.city, city);
        I.fillField(this.locators.phone, phone);
        I.fillField(this.locators.zip, zipcode);
    },
    fillPaymentInfoGuest(fName, lName, address1, city, stateAbr, zipcode, phone, ccNum, expMonth, expYear, ccSecCode) {
        I.waitForElement(this.locators.checkout_prefilledShippingInfo);
        I.see(fName, this.locators.checkout_prefilledShippingInfo);
        I.see(lName, this.locators.checkout_prefilledShippingInfo);
        I.see(address1, this.locators.checkout_prefilledShippingInfo);
        I.see(city, this.locators.checkout_prefilledShippingInfo);
        I.see(stateAbr, this.locators.checkout_prefilledShippingInfo);
        I.see(zipcode, this.locators.checkout_prefilledShippingInfo);
        I.fillField(this.locators.payPhone, phone);
        I.fillField(this.locators.payCard, ccNum);
        I.waitForElement(this.locators.payExpMonth, expMonth);
        I.selectOption(this.locators.payExpMonth, expMonth);
        I.waitForElement(this.locators.payExpYear, expYear);
        I.selectOption(this.locators.payExpYear, expYear);
        I.waitForElement(this.locators.paySecCode);
        I.fillField(this.locators.paySecCode, ccSecCode);
    },
    fillPaymentInfoRegistered(phone, ccSecCode) {
        I.fillField(this.locators.payPhone, phone);
        I.waitForElement(this.locators.paySecCodeSaved);
        I.fillField(this.locators.paySecCodeSaved, ccSecCode);
    },
    verifyCart(quantity, itemPrice, totalItemPrice, shipping, tax, estimatedTotal) {
        I.waitForElement(this.locators.lineItemQuantity);
        I.waitForText(quantity, this.locators.lineItemQuantity);
        I.waitForElement(this.locators.totalItemQuantity);
        I.waitForText(quantity + ' Items', this.locators.totalItemQuantity);
        I.waitForElement(this.locators.lineItemPriceTotal);
        I.waitForText(itemPrice, this.locators.lineItemPriceTotal);
        I.waitForElement(this.locators.totalItemPrice);
        I.waitForText(totalItemPrice, this.locators.totalItemPrice);
        I.waitForElement(this.locators.shippingCost);
        I.waitForText(shipping, this.locators.shippingCost);
        I.waitForElement(this.locators.taxTotal);
        I.waitForText(tax, this.locators.taxTotal);
        I.waitForElement(this.locators.estimatedTotal);
        I.waitForText(estimatedTotal, this.locators.estimatedTotal);
    },
    fillReturnCustomerInfo(email, password) {
        I.waitForElement(this.locators.email);
        I.fillField(this.locators.email, email);
        I.waitForElement(this.locators.password);
        I.fillField(this.locators.password, password);
    },
    verifyShipping(fname, lname, add1, city, stateAbr, zip) {
        I.waitForElement(this.locators.shipping_addSelector);
        I.waitForText(`${fname} ${lname} ${add1}`, this.locators.shipping_addSelector);
        I.waitForText(`${city}, ${stateAbr} ${zip}`, this.locators.shipping_addSelector);
        I.waitForElement(this.locators.shipping_methodBlock);
        I.seeNumberOfVisibleElements(this.locators.shipping_methodOptions, 3);
    },
    verifyBilling() {
        // Check for best way to verify this one
        I.waitForElement(this.locators.billingConfirmation);
        I.waitForText(fName + lName + address1);
    },
    verifyCheckoutInfo(fName, lName, add1, city, zip, phone, ccNum, ccExpDate, quantity,
        totalItemPrice, shipping, tax, estimatedTotal) {
        // verify shipping address is correct
        I.scrollTo(this.locators.checkout_shippingSection);
        I.see(fName, this.locators.checkout_shippingSection);
        I.see(lName, this.locators.checkout_shippingSection);
        I.see(add1, this.locators.checkout_shippingSection);
        I.see(city, this.locators.checkout_shippingSection);
        I.see(zip, this.locators.checkout_shippingSection);
        I.see(phone, this.locators.checkout_shippingSection);

        // verify billing address is correct
        I.scrollTo(this.locators.checkout_paymentSection);
        I.see(fName, this.locators.checkout_paymentSection);
        I.see(lName, this.locators.checkout_paymentSection);
        I.see(add1, this.locators.checkout_paymentSection);
        I.see(city, this.locators.checkout_paymentSection);
        I.see(zip, this.locators.checkout_paymentSection);
        I.see(phone, this.locators.checkout_paymentSection);

        // verify payment info is correct
        // Leave the last 4 digits shown; replace everything else with '*'
        I.see(ccNum.replace(/\d(?=\d{4})/g, '*'), this.locators.checkout_paymentSection);
        I.see(ccExpDate, this.locators.checkout_paymentSection);

        // verify product info is correct
        I.scrollTo(this.locators.orderConf_quantity);
        I.see(quantity, this.locators.orderConf_quantity);

        I.see(totalItemPrice, this.locators.checkout_orderSummary);
        I.see(shipping, this.locators.checkout_orderSummary);
        I.see(tax, this.locators.checkout_orderSummary);
        I.see(estimatedTotal, this.locators.checkout_orderSummary);
    },
    verifyOrderConfirmation(fName, lName, add1, city, zip, phone, email, ccNum, ccExpDate, quantity,
        totalItemPrice, shipping, tax, estimatedTotal) {
        // verify order is place successfully by verifying the order confirmation page
        I.scrollTo(this.locators.orderConf_thankYou);
        I.see('Thank you for your order.', this.locators.orderConf_thankYou);

        // verify shipping address is correct
        I.scrollTo(this.locators.orderConf_shippingSection);
        I.see(fName, this.locators.orderConf_shippingSection);
        I.see(lName, this.locators.orderConf_shippingSection);
        I.see(add1, this.locators.orderConf_shippingSection);
        I.see(city, this.locators.orderConf_shippingSection);
        I.see(zip, this.locators.orderConf_shippingSection);
        I.see(phone, this.locators.orderConf_shippingSection);

        // verify billing address is correct
        I.scrollTo(this.locators.orderConf_billingSection);
        I.see(fName, this.locators.orderConf_billingSection);
        I.see(lName, this.locators.orderConf_billingSection);
        I.see(add1, this.locators.orderConf_billingSection);
        I.see(city, this.locators.orderConf_billingSection);
        I.see(zip, this.locators.orderConf_billingSection);
        I.see(email, this.locators.orderConf_billingSection);
        I.see(phone, this.locators.orderConf_billingSection);

        // verify payment info is correct
        // Leave the last 4 digits shown; replace everything else with '*'
        I.see(ccNum.replace(/\d(?=\d{4})/g, '*'), this.locators.orderConf_paymentSection);
        I.see(ccExpDate, this.locators.orderConf_paymentSection);

        // verify product info is correct
        I.scrollTo(this.locators.orderConf_quantity);
        I.see(quantity, this.locators.orderConf_quantity);

        I.see(totalItemPrice, this.locators.orderConf_totalSection);
        I.see(shipping, this.locators.orderConf_totalSection);
        I.see(tax, this.locators.orderConf_totalSection);
        I.see(estimatedTotal, this.locators.orderConf_totalSection);
    },
    gotoHomePageFromCheckout() {
        I.click(this.locators.homeLink);
    }
};
