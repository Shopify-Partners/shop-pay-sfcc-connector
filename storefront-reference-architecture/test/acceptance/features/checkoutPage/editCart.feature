Feature: Edit products within the cart
    As a shopper I want to be able to add multiple products to my cart,
    and edit my cart before entering checkout.

@editCart
    Scenario: Shopper is able to edit products in their cart
        When shopper selects yes or no for tracking consent
        Given Shopper searches for "Elbow Sleeve Ribbed Sweater"
        Then selects size "S"
        Then shopper changes product quantity
        Then he adds the product to cart
        Given Shopper searches for "Modern Striped Dress Shirt"
        Then selects size "16R"
        Then he adds the product to cart
        Then shopper edits products in cart