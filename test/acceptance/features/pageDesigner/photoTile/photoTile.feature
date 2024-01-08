Feature: Photo Tile Component on Page Designer Home Page
    As a shopper, I should see the Photo Tile Component

@photoTile @pageDesigner
    Scenario: Shopper should be able to see the Photo Tile Component
        When shopper load Page Designer home page
        Then shopper accept the Consent Tracking Modal
        Then shopper should see the photo tile component