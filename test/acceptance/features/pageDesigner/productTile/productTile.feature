Feature: Product Tile on Page Designer Home Page
    As a shopper, I should see the product Tile

    @productTile @pageDesigner
    Scenario: Shopper should able to see the product tile with default attributes
        When shopper load Page Designer home page
        Then shopper accept the Consent Tracking Modal
        Then shopper should see the product tile component
        Then shopper should see the alt attribute on product image
        Then shopper should see the title attribute on product image
        Then shopper should not see quickview on product tile
        Then shopper should see the product name on product tile
        Then shopper should see the regular price on product tile
        Then shopper should see the strike-through price on product tile
        Then shopper should see the sales price on product tile
        Then shopper should go to the product details page clicking on the image
        Then shopper load Page Designer home page
        Then shopper should go to the product details page clicking on product name
