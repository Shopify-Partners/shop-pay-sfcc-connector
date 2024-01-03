Feature: Follow the happy path of a registered user
    As a shopper, I want to shop for a product, log into my account, and fill out the correct
    shipping information based on previous saved user data.

    Background:
        Given shopper logs into the website
        And shopper clicks add new payment
        And shopper fills out their payment information

@happyPath @testing
    Scenario: Registered shopper should be able to follow the checkout flow
        Given Shopper searches for "Elbow Sleeve Ribbed Sweater"
        Then selects size "S"
        Then he adds the product to cart
        Then shopper goes to cart
        Then shopper changes product quantity to "2"
        And shopper selects checkout from cart
        And shopper verifies shipping information
        Then shopper proceeds to payment section
        And shopper fills out registered user billing information
        Then shopper places order
        And shopper verifies the order confirmation page
        Then shopper goes to profile saved payments page and deletes credit card
        And logs out of the account
        Given shopper goes to the Login Page
        Then shopper is able to fill out the order number, email, and zip code
        And shopper is able to click the check status button
        And shopper is able to view order detail
