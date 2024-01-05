Feature: Add Payment to User Account
    As a shopper with an account, I want to be able to add a saved payment

@accountPage
    Scenario: Shopper is able to add a payment to their account
        Given shopper logs into the website
        And shopper clicks add new payment
        And shopper fills out their payment information
        Then shopper clicks view payments
        And shopper removes a saved credit card