Feature: Filter products from PDP
    As a shopper I want navigate back to the previous plp using the back button.


@productBackButton
    Scenario: Shopper is able to go back to refined plp from pdp
        When shopper selects yes or no for tracking consent
        Given shopper searches for category from menu
        And shopper clicks on the more button
        Then Shopper clicks on the first product Tile
        And Shopper clicks the back button on pdp
