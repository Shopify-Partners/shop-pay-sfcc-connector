Feature: Store locator
    As a shopper, I want to view available store locations

@homePage
    Scenario: Shopper is able to use store locator.
        When shopper selects yes or no for tracking consent
        Then shopper goes to store locator page
        And shopper searches for a store
        Then shopper searches for a store with different radius