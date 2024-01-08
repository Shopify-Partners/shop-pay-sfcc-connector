Feature: Main Banner on Page Designer Home Page
  As a shopper, I should see the main banner

  @mainBanner @pageDesigner
  Scenario: Shopper should able to see the main banner
    When shopper load Page Designer home page
    Then shopper accept the Consent Tracking Modal
    Then shopper should see the main banner
    Then shopper should see the main banner message
    Then shopper should go to womens clothing dresses clicking on the main banner
