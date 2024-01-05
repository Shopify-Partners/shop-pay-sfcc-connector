Feature: Follow the happy path of a guest user
    As a shopper, I want to shop for a product and fill out the correct
    shipping information/billing information in checkout.

@happyPath
    Scenario: Guest shopper should be able to follow the checkout flow
        When shopper selects yes or no for tracking consent
        Given Shopper searches for "Elbow Sleeve Ribbed Sweater"
        Then selects size "S"
        Then he adds the product to cart
        Then shopper goes to cart
        Then shopper changes product quantity to "2"
        And shopper selects checkout from cart
        And shopper selects checkout as guest
        And shopper fills out shipping information
        Then shopper proceeds to payment section
        And shopper fills out billing information
        Then shopper places order
        And shopper verifies the order confirmation page