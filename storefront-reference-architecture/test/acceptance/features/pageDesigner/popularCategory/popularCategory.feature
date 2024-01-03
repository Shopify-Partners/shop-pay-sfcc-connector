Feature: Popular Category on Page Designer Home Page
    As a shopper, I want to see the popular category component

@popularCategory @pageDesigner
    Scenario: Shopper is able to see the popular category
        When shopper load Page Designer home page
        Then shopper accept the Consent Tracking Modal
        Then shopper should see the popularCategories layout
        Then shopper should see the popularCategory components
        And shopper can click on a popular category
