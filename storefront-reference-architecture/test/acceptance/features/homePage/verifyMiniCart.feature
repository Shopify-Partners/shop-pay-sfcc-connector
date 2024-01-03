Feature: Modify & Verify Mini Cart
    As a shopper, I want to verify selected product attributes and modify (edit quantity and remove product) mini cart

@miniCart @miniCartGuestUser
    Scenario: Shopper is able to modify mini cart, verify selected product attributes and goto Guest Checkout
        Given shopper selects yes or no for tracking consent
        When shopper is able to add and remove a product from minicart
        And shopper is able to add a product and edit product quantity in minicart
        Then shopper goes to Guest Checkout page from minicart

@miniCart @miniCartRegisteredUser
    Scenario: Shopper is able to modify mini cart, verify selected product attributes and goto Registered Checkout
        Given shopper logs into the website
        When shopper is able to add a product and edit product quantity in minicart
        And shopper is able to navigate through minicart, registered checkout pages and remove the product from cart