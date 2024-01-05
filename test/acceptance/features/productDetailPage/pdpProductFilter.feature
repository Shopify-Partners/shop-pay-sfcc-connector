Feature: Filter products from PDP
    As a shopper I want to be able to search for a product type
    And then select different filter options to reduce the number of potential
    items.

@productFilter 
    Scenario: Shopper is able to filter for products
        When shopper selects yes or no for tracking consent
        Given shopper searches for category from menu
        And shopper filters product by color
        And shopper filters product by size
        And shopper filters product by price
        And shopper filters product by option
