Feature: Product Detail Page Simple Layout
    As a shopper, I want to see Product Details for a Simple Product

    Background: shoper is on product details page
        When shopper goes to the Product Detail Page

    @simpleProductDetail
    Scenario: Shopper sees all the product related information on the Simple product page
        Then shopper sees all the product related information

    @simpleProductDetail_breadcrumbs
    Scenario: Shopper sees the correct breadcrumbs and is on right navigation path
        Then shopper sees the correct breadcrumbs

    @simpleProductDetail_socialLinks
    Scenario: Shopper sees the correct social links
        Then shopper sees the correct social links
    
    @simpleProductDetail_addToCartButton
    Scenario: Shopper sees the Add to Cart Button Enabled
        Then shopper is able to see Add to Cart Button Enabled
    
    @simpleProductDetail_addToCartButton
    Scenario: Shopper is able to copy Product URL using Copy Link Icon
        Then shopper is able to copy Product URL using Copy Link Icon
