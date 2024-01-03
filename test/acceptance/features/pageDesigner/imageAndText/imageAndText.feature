Feature: Image And Text Component on Page Designer Home Page
    As a shopper, I should see the Image And Text Component

@ITC @pageDesigner
    Scenario: Shopper should be able to see the Image And Text Component
        When shopper load Page Designer home page
        Then shopper accept the Consent Tracking Modal
        Then shopper should see the image and text component
        Then shopper should see the overlay message
        Then shopper should go to new arrivals page clicking on the image