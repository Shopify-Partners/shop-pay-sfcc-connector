Feature: Create an Account
    As a shopper, I want to be able to create an account with the site

@loginPage @createAccount @deepTest
Scenario: Shopper is able to create a new account from the login page
    Given shopper goes to the Login Page
    Then shopper is able to click tab to create account
    And shopper is able fill out registration information with new email
    And shopper is able to click the create account button
    And shopper does not see a username is invalid error

@loginPage @createAccount
Scenario: Shopper is not able to create an account that already exists
    Given shopper goes to the Login Page
    Then shopper is able to click tab to create account
    And shopper is able fill out registration information with existing email
    And shopper is able to click the create account button
    And shopper sees a username is invalid error