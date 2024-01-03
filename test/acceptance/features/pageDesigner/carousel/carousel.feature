Feature: Page Designer Carousel
  As a shopper, I want to see the page designer carousel

  @Carousel @pageDesigner
  Scenario: Shopper is able to interact with the page designer carousel component
    When shopper load Page Designer home page
    Then shopper accept the Consent Tracking Modal
    And Shopper sees the carousel "1"
    Given Shopper sees carousel controls in carousel "1"
    When Shopper clicks next in carousel "1" 1 time
    Then Shopper should see the next slide in the first carousel
    When Shopper clicks previous in carousel "1"
    Then Shopper should see the previous slide in the first carousel
  
  @Carousel @pageDesigner
  Scenario: Shopper is able to interact with the page designer carousel-2 component
    When shopper load Page Designer home page
    Then shopper accept the Consent Tracking Modal
    And Shopper sees the carousel "2"
    Given Shopper sees carousel controls in carousel "2"
    When Shopper clicks next in carousel "2" 5 times
    Then Shopper should see next product in the second carousel
    When Shopper clicks previous in carousel "2"
    Then Shopper should see previous slide in the second carousel
