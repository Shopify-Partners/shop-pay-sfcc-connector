Feature: Campaign Banner on Page Designer Home Page
    As a shopper, I shoiuld see the campaign banner

@campaignBanner @pageDesigner
    Scenario: Shopper should able to see the campaign banner
        When shopper load Page Designer home page
        Then shopper accept the Consent Tracking Modal
        Then shopper should see the campaign banner
        And shopper should see the campaign banner message
        And shopper should see a close button on campaign banner
        And shopper should be able to close the campaign banner
        And shopper should no longer see the campaign banner
