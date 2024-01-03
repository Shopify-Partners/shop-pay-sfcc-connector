Feature: Shop Category on Page Designer Home Page
    As a shopper, I should see the Shop Category

    @shopCategory @pageDesigner
    Scenario: Shopper should able to see the Shop Category on Page Designer Home Page
        When shopper load Page Designer home page
        Then shopper accept the Consent Tracking Modal
        Then shopper should see the shop category heading
        Then shopper should see 5 shop categories
        Then shopper should go to the category page by clicking on the category link

