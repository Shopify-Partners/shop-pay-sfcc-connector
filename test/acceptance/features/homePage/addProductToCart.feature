Feature: Add Product To Cart
    As a shopper, I want to search for a product and add it to cart

@homePage @cart
    Scenario: Shopper is able to add a product to a cart
        When shopper selects yes or no for tracking consent
        Given Shopper searches for "Elbow Sleeve Ribbed Sweater"
        Then selects size "S"
        Then shopper changes product quantity
        Then he adds the product to cart
        Then he is able to see the correct product in cart