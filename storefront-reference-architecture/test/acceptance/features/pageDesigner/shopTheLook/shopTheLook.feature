Feature: Shop The Look Component on Page Designer Home Page
    As a shopper, I should see the Shop The Look Component

@shopTheLook @pageDesigner
    Scenario: Shopper should be able to see the shop the look Component
        When shopper load Page Designer home page
        Then shopper accept the Consent Tracking Modal
        Then shopper should see the shop the look component
        Then shopper should see the title when hover over image
        Then shopper should not see the setItem when hover over image on product