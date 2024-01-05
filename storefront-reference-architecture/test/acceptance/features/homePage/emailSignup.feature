Feature: Email signup
    As a shopper, I want to signup to mailing list

@homePage
    Scenario: Shopper is able to enter email for signup
        When shopper selects yes or no for tracking consent
        Then shopper enters email in signup form
        And shopper subscribes to the email list