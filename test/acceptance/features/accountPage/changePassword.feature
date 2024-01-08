Feature: Edit password of a User Account
    As a shopper with an account, I want to be able to change my password

@accountPage
    Scenario: Shopper is able to change their password
        Given shopper logs into the website
        And shopper clicks edit password
        And shopper changes their password