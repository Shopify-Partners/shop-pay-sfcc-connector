Feature: category on Page Designer Home Page
    As a shopper, I want to see the category component

@category @pageDesigner
    Scenario: Shopper is able to see the category
        When shopper load Page Designer home page
        Then shopper accept the Consent Tracking Modal
        Then shopper should see the category components
        And shopper can click on a category link
