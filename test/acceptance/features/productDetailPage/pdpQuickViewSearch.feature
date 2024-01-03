Feature: Product Quickview
    As a shopper I want to be able to search for a product from the menu
    then add the product to cart using Quick View

@productQuickView 
    Scenario: Shopper is able to shop using a product's quick view
        When shopper selects yes or no for tracking consent
        And shopper opens product quick view from home page
        Then shopper adds to cart from Quick View
