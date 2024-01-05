Feature: User Login
    As a shopper, I want to be able to log into the site

@loginPage 
    Scenario: Shopper is able to log into the site from the home page
        Given shopper logs into the website

@loginPage @mobile
    Scenario: Shopper is able to log into the site mobile
        Given shopper logs into the website on phone

@loginPage @tablet
    Scenario: Shopper is able to log into the site tablet
        Given shopper logs into the website on tablet