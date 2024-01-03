Feature: Add Address to User Account
    As a shopper with an account, I want to be able to add a saved address

@accountPage
    Scenario: Shopper is able to add an address to their account
        Given shopper logs into the website
        And shopper clicks add new address
        And shopper fills out address information