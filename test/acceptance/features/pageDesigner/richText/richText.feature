Feature: Rich Text Component on Page Designer Home Page
    As a shopper, I should see the Rich Text Component

@richText @pageDesigner
    Scenario: Shopper should be able to see the rich text Component
        When shopper load Page Designer home page
        Then shopper accept the Consent Tracking Modal
        Then shopper should see the rich text component
        Then shopper should see the title