# Page Designer Components for Storefront Reference Architecture

SFRA uses the following Page Designer components:

* [Header Promo Banner](#Header-Promo-Banner)
* [Carousel](#Carousel)
* [Einstein Carousel](#Einstein-Carousel)
* [Link Banner](#Link-Banner)
* [Textbox](#Textbox)
* [Image with Text](#Image-with-Text)
* [Main Banner](#Main-Banner)
* [1 Row x 1 Col (Mobile, Desktop)](#1-Row-x-1-Col-(Mobile,-Desktop))
* [2 Row x 1 Col (Mobile), 1 Row x 2 Col (Desktop)](#2-Row-x-1-Col-(Mobile),-1-Row-x-2-Col-(Desktop))
* [2 Row x 2 Col (Mobile), 1 Row x 4 Col (Desktop)](#2-Row-x-2-Col-(Mobile),-1-Row-x-4-Col-(Desktop))
* [2 Row x 3 Col (Mobile), 1 Row x 6 Col (Desktop)](#2-Row-x-3-Col-(Mobile),-1-Row-x-6-Col-(Desktop))
* [3 Row x 1 Col (Mobile), 1 Row x 3 Col (Desktop)](#3-Row-x-1-Col-(Mobile),-1-Row-x-3-Col-(Desktop))
* [3 Row x 2 Col (Mobile), 2 Row x 3 Col (Desktop)](#3-Row-x-2-Col-(Mobile),-2-Row-x-3-Col-(Desktop))
* [Shop the Look Layout](#Mobile-Grid-Shop-The-Look)
* [Image Tile](#Image-Tile)
* [Popular Categories Layout](#Popular-Categories-Layout)
* [Round Category Tile with Caption](#Round-Category-Tile-with-Caption)
* [Product Tile](#Product-Tile)
* [Shop The Look Product Tile](#Shop-The-Look-Product-Tile)

-------------------

## Header Promo Banner

This component is a thin banner used for campaigns and announcements.

### Files
```
./cartridges/app_storefront_base/cartridge/client/default/js/campaignBanner.js
./cartridges/app_storefront_base/cartridge/client/default/scss/experience/components/commerceAssets/campaignBanner.scss
./cartridges/app_storefront_base/cartridge/experience/components/commerce_assets/campaignBanner.js
./cartridges/app_storefront_base/cartridge/experience/components/commerce_assets/campaignBanner.json
./cartridges/app_storefront_base/cartridge/templates/default/experience/components/commerce_assets/campaignBanner.isml
./cartridges/app_storefront_base/cartridge/templates/resources/campaignBanner.properties
./cartridges/bm_app_storefront_base/cartridge/templates/resources/experience/components/commerce_assets/campaignBanner.properties
```

### Notes

This component has a text attribute for a campaign announcement.

This component depends on either the “Customer Groups” settings or the “Schedule” settings at the top of the component attributes panel.

[Return to top](#Page-Designer-Components-for-Storefront-Reference-Architecture)

-------------------

## Carousel

Enables a shopper to visually cycle through multiple other components, such as [Product Tile](#Product-Tile) components.

### Files
```
./cartridges/app_storefront_base/cartridge/client/default/js/carousel.js
./cartridges/app_storefront_base/cartridge/client/default/scss/experience/components/commerceLayouts/carousel.scss
./cartridges/app_storefront_base/cartridge/experience/components/commerce_layouts/carousel.js
./cartridges/app_storefront_base/cartridge/experience/components/commerce_layouts/carousel.json
./cartridges/app_storefront_base/cartridge/templates/default/experience/components/commerce_layouts/carousel.isml
./cartridges/bm_app_storefront_base/cartridge/templates/resources/experience/components/commerce_layouts/carousel.properties
```

### Notes

The carousel has configurable display attributes for phone and desktop.

This component reuses and overrides the Bootstrap Carousel.

[Return to top](#Page-Designer-Components-for-Storefront-Reference-Architecture)

-------------------

## Einstein Carousel

Enables a shopper to visually cycle through [Product Tile](#Product-Tile) components that are based on product IDs coming from the Einstein engine.  This component depends on the [Product Tile](#Product-Tile) component and the [Carousel](#Carousel) component.

### Files
```
./cartridges/app_storefront_base/cartridge/client/default/js/carousel.js
./cartridges/app_storefront_base/cartridge/client/default/js/einstienCarousel.js
./cartridges/app_storefront_base/cartridge/client/default/scss/experience/components/einstein/einsteinCarousel.scss
./cartridges/app_storefront_base/cartridge/controllers/EinsteinCarousel.js
./cartridges/app_storefront_base/cartridge/experience/components/einstein/einsteinCarousel.js
./cartridges/app_storefront_base/cartridge/experience/components/einstein/einsteinCarousel.json
./cartridges/app_storefront_base/cartridge/experience/components/einstein/einsteinCarouselCategory.js
./cartridges/app_storefront_base/cartridge/experience/components/einstein/einsteinCarouselCategory.json
./cartridges/app_storefront_base/cartridge/experience/components/einstein/einsteinCarouselProduct.js
./cartridges/app_storefront_base/cartridge/experience/components/einstein/einsteinCarouselProduct.json
./cartridges/app_storefront_base/cartridge/scripts/experience/utilities/carouselBuilder.js
./cartridges/app_storefront_base/cartridge/templates/default/experience/components/einstein/einsteinCarousel.isml
./cartridges/app_storefront_base/cartridge/templates/default/experience/components/commerce_assets/product/productTileWrapper.isml
./cartridges/app_storefront_base/cartridge/templates/resources/error.properties
./cartridges/app_storefront_base/cartridge/templates/resources/pageDesigner.properties
./cartridges/app_storefront_base/cartridge/experience/editors/einstein/categoryrecommenderselector.js
./cartridges/app_storefront_base/cartridge/experience/editors/einstein/categoryrecommenderselector.json
./cartridges/bm_app_storefront_base/cartridge/experience/editors/einstein/globalrecommenderselector.js
./cartridges/app_storefront_base/cartridge/experience/editors/einstein/globalrecommenderselector.json
./cartridges/app_storefront_base/cartridge/experience/editors/einstein/productrecommenderselector.js
./cartridges/app_storefront_base/cartridge/static/default/experience/editors/einstein/recommenderselector.js
./cartridges/app_storefront_base/cartridge/templates/resources/experience/components/einstein/einsteinCarousel.properties
./cartridges/app_storefront_base/cartridge/templates/resources/experience/components/einstein/einsteinCarouselCategory.properties
./cartridges/app_storefront_base/cartridge/templates/resources/experience/components/einstein/einsteinCarouselProduct.properties
```

### Notes

This component has configurable display attributes for phone and desktop. It reuses and overrides the Bootstrap Carousel.

This component runs on a PIG instance and requires support access to be enabled.

This component uses the product tile component isml file.

There are three Einstein components to choose from.

    1. Einstein Carousel (Recently Viewed)
        a. recently viewed
        b. viewed-recently-einstein
        c. products-in-all-categories
        d. home-page-recommender-mens
        e. home-page-recommender-womens
    2. Einstein Carousel (Product)
        a. Product to Product Recommendation
        b. pdp
    3. Einstein Carousel (Category) Component recommenders
        a. products-in-a-category-einstein

[Return to top](#Page-Designer-Components-for-Storefront-Reference-Architecture)

-------------------

## Link Banner

Shows a navigation bar with links to categories.

### Files
```
./cartridges/app_storefront_base/cartridge/client/default/scss/experience/components/commerce_assets/category.scss
./cartridges/app_storefront_base/cartridge/experience/components/commerce_assets/category.js
./cartridges/app_storefront_base/cartridge/experience/components/commerce_assets/category.json
./cartridges/app_storefront_base/cartridge/templates/default/experience/components/commerce_assets/category.isml
./cartridges/bm_app_storefront_base/cartridge/templates/resources/experience/components/commerce_assets/category.properties
```

### Notes

Has a text headline attribute.
Has an image picker attribute for selecting background image and focal point.
Has applying shade to image attribute.
Has change text to white color attribute.
Has four required and eight optional category attributes.

[Return to top](#Page-Designer-Components-for-Storefront-Reference-Architecture)

-------------------

## Textbox

Shows text or pictures within a section.

### Files
```
./cartridges/app_storefront_base/cartridge/experience/components/commerce_assets/editorialRichText.js
./cartridges/app_storefront_base/cartridge/experience/components/commerce_assets/editorialRichText.json
./cartridges/app_storefront_base/cartridge/templates/default/experience/components/commerce_assets/editorialRichText.isml
./cartridges/bm_app_storefront_base/cartridge/templates/resources/experience/components/commerce_assets/editorialRichText.properties
```

### Notes

Has one rich text attribute.

[Return to top](#Page-Designer-Components-for-Storefront-Reference-Architecture)

-------------------

## Image with Text

A component showing combined image and text.

### Files
```
./cartridges/app_storefront_base/cartridge/experience/components/commerce_assets/imageAndText.js
./cartridges/app_storefront_base/cartridge/experience/components/commerce_assets/imageAndText.json
./cartridges/app_storefront_base/cartridge/templates/default/experience/components/commerce_assets/imageAndText.isml
./cartridges/bm_app_storefront_base/cartridge/templates/resources/experience/components/commerce_assets/imageAndText.properties
./cartridges/app_storefront_base/cartridge/client/default/scss/experience/components/commerceAssets/imageAndTextCommon.scss
```

### Notes

Has an image picker attribute and focal point.
Has an optional alt text attribute.
Has an optional text overlay attribute.
Has an optional image link attribute.
Has an optional text under image attribute.

[Return to top](#Page-Designer-Components-for-Storefront-Reference-Architecture)

-------------------

## Main Banner

Shows a hero image with a text overlay and a ‘Shop Now’ link.

### Files
```
./cartridges/app_storefront_base/cartridge/experience/components/commerce_assets/mainBanner.js
./cartridges/app_storefront_base/cartridge/experience/components/commerce_assets/mainBanner.json
./cartridges/app_storefront_base/cartridge/templates/default/experience/components/commerce_assets/mainBanner.isml
./cartridges/app_storefront_base/cartridge/client/default/scss/experience/components/commerceAssets/imageAndTextCommon.scss
./cartridges/bm_app_storefront_base/cartridge/templates/resources/experience/components/commerce_assets/mainBanner.properties
```

### Notes

Has an image attribute, a text overlay attribute, and a category picker to create a link.

[Return to top](#Page-Designer-Components-for-Storefront-Reference-Architecture)

-------------------

## 1 Row x 1 Col (Mobile, Desktop)

Shows a grid with one region into which a merchant can drop other components.

### Files
```
./cartridges/app_storefront_base/cartridge/experience/components/commerce_layouts/mobileGrid1r1c.js
./cartridges/app_storefront_base/cartridge/experience/components/commerce_layouts/mobileGrid1r1c.json
./cartridges/app_storefront_base/cartridge/templates/default/experience/components/commerce_layouts/mobileGrid1r1c.isml
./cartridges/bm_app_storefront_base/cartridge/templates/resources/experience/components/commerce_layouts/mobileGrid1r1c.properties
```

### Notes

Mobile phone, tablet, and desktop mode all show one row by one column.

[Return to top](#Page-Designer-Components-for-Storefront-Reference-Architecture)

-------------------

## 2 Row x 1 Col (Mobile), 1 Row x 2 Col (Desktop)

Shows a grid with two regions into which a merchant can drop other components.

### Files
```
./cartridges/app_storefront_base/cartridge/experience/components/commerce_layouts/mobileGrid2r1c.js
./cartridges/app_storefront_base/cartridge/experience/components/commerce_layouts/mobileGrid2r1c.json
./cartridges/app_storefront_base/cartridge/templates/default/experience/components/commerce_layouts/mobileGrid2r1c.isml
./cartridges/bm_app_storefront_base/cartridge/templates/resources/experience/components/commerce_layouts/mobileGrid2r1c.properties
```

### Notes

Mobile phone and tablet mode show two rows by one column.
Desktop mode shows one row by two columns.

[Return to top](#Page-Designer-Components-for-Storefront-Reference-Architecture)

-------------------

## 3 Row x 1 Col (Mobile), 1 Row x 3 Col (Desktop)

Shows a grid with three regions into which a merchant can drop other components.

### Files
```
./cartridges/app_storefront_base/cartridge/experience/components/commerce_layouts/mobileGrid3r1c.js
./cartridges/app_storefront_base/cartridge/experience/components/commerce_layouts/mobileGrid3r1c.json
./cartridges/app_storefront_base/cartridge/templates/default/experience/components/commerce_layouts/mobileGrid3r1c.isml
./cartridges/bm_app_storefront_base/cartridge/templates/resources/experience/components/commerce_layouts/mobileGrid3r1c.properties
```

### Notes

Mobile phone and tablet mode show three rows by one column.
Desktop mode shows one row by three columns.

[Return to top](#Page-Designer-Components-for-Storefront-Reference-Architecture)

-------------------

## 2 Row x 2 Col (Mobile), 1 Row x 4 Col (Desktop)

Shows a grid with four regions into which a merchant can drop other components.

### Files
```
./cartridges/app_storefront_base/cartridge/experience/components/commerce_layouts/mobileGrid2r2c.js
./cartridges/app_storefront_base/cartridge/experience/components/commerce_layouts/mobileGrid2r2c.json
./cartridges/app_storefront_base/cartridge/templates/default/experience/components/commerce_layouts/mobileGrid2r2c.isml
./cartridges/bm_app_storefront_base/cartridge/templates/resources/experience/components/commerce_layouts/mobileGrid2r2c.properties
```

### Notes

Mobile phone and tablet mode show two rows by two columns.
Desktop mode shows one row by four columns.

[Return to top](#Page-Designer-Components-for-Storefront-Reference-Architecture)

-------------------


## 2 Row x 3 Col (Mobile), 1 Row x 6 Col (Desktop)

Shows a grid with six regions into which a merchant can drop other components.

### Files
```
./cartridges/app_storefront_base/cartridge/experience/components/commerce_layouts/mobileGrid2r3c.js
./cartridges/app_storefront_base/cartridge/experience/components/commerce_layouts/mobileGrid2r3c.json
./cartridges/app_storefront_base/cartridge/templates/default/experience/components/commerce_layouts/mobileGrid2r3c.isml
./cartridges/bm_app_storefront_base/cartridge/templates/resources/experience/components/commerce_layouts/mobileGrid2r3c.properties
```

### Notes

Desktop and Tablet mode show onr row by six columns.

Mobile Phone mode shows two rows by three Columns.

[Return to top](#Page-Designer-Components-for-Storefront-Reference-Architecture)

-------------------

## 3 Row x 2 Col (Mobile), 2 Row x 3 Col (Desktop)

Shows a grid with six regions into which a merchant can drop other components.

### Files
```
./cartridges/app_storefront_base/cartridge/experience/components/commerce_layouts/mobileGrid3r2c.js
./cartridges/app_storefront_base/cartridge/experience/components/commerce_layouts/mobileGrid3r2c.json
./cartridges/app_storefront_base/cartridge/templates/default/experience/components/commerce_layouts/mobileGrid3r2c.isml
./cartridges/bm_app_storefront_base/cartridge/templates/resources/experience/components/commerce_layouts/mobileGrid3r2c.properties
```

### Notes

Desktop and Tablet mode show two rows by three columns.

Mobile Phone mode shows three rows by two columns.

[Return to top](#Page-Designer-Components-for-Storefront-Reference-Architecture)

-------------------

## Mobile Grid Shop The Look

Shows a grid with six regions into which a merchant can drop other components.

### Files
```
./cartridges/app_storefront_base/cartridge/client/default/js/mobileGridLookBook.js
./cartridges/app_storefront_base/cartridge/client/default/scss/experience/components/commerceAssets/mobileGridLookBook.scss
./cartridges/app_storefront_base/cartridge/experience/components/commerce_assets/mobileGridLookBook.js
./cartridges/app_storefront_base/cartridge/experience/components/commerce_assets/mobileGridLookBook.json
./cartridges/app_storefront_base/cartridge/templates/default/experience/components/commerce_assets/mobileGridLookBook.isml
./cartridges/app_storefront_base/cartridge/templates/resources/mobileGridLookBook.properties
./cartridges/bm_app_storefront_base/cartridge/templates/resources/experience/components/commerce_assets/mobileGridLookBook.properties
```

### Notes

Desktop mode shows one double-width, double-height container next to two rows of one column on top of one row of three columns.

Mobile Phone and Tablet mode show one double-width, double-height row on top of one row of two columns. A show more button expands to another double-width, double-height row on top of another row of two columns.

[Return to top](#Page-Designer-Components-for-Storefront-Reference-Architecture)

-------------------

## Image Tile

Adds an image to a page or section.

### Files
```
./cartridges/app_storefront_base/cartridge/client/default/scss/experience/components/commerceAssets/photoTile.scss
./cartridges/app_storefront_base/cartridge/experience/components/commerce_assets/photoTile.js
./cartridges/app_storefront_base/cartridge/experience/components/commerce_assets/photoTile.json
./cartridges/app_storefront_base/cartridge/templates/default/experience/components/commerce_assets/photoTile.isml
./cartridges/bm_app_storefront_base/cartridge/templates/resources/experience/components/commerce_assets/photoTile.properties
```

### Notes

Has a single image picker attribute.

[Return to top](#Page-Designer-Components-for-Storefront-Reference-Architecture)

-------------------


## Popular Categories Layout

Shows one or more [Round Category Tile with Caption](#Round-Category-Tile-with-Caption) components.

### Files
```
./cartridges/app_storefront_base/cartridge/client/default/scss/experience/components/commerceLayouts/popularCategories.scss
./cartridges/app_storefront_base/cartridge/experience/components/commerce_layouts/popularCategories.js
./cartridges/app_storefront_base/cartridge/experience/components/commerce_layouts/popularCategories.json
./cartridges/app_storefront_base/cartridge/templates/default/experience/components/commerce_layouts/popularCategories.isml
./cartridges/bm_app_storefront_base/cartridge/templates/resources/experience/components/commerce_layouts/popularCategories.properties
```

### Notes

Has a text headline attribute. This component can hold an arbitrary number of [Round Category Tile with Caption](#Round-Category-Tile-with-Caption) components.

[Return to top](#Page-Designer-Components-for-Storefront-Reference-Architecture)

-------------------

## Round Category Tile with Caption

Shows a round category tile with a caption.

### Files
```
./cartridges/app_storefront_base/cartridge/client/default/scss/experience/components/commerce_assets/popularCategory.scss
./cartridges/app_storefront_base/cartridge/experience/components/commerce_assets/popularCategory.js
./cartridges/app_storefront_base/cartridge/experience/components/commerce_assets/popularCategory.json
./cartridges/app_storefront_base/cartridge/templates/default/experience/components/commerce_assets/popularCategory.isml
./cartridges/bm_app_storefront_base/cartridge/templates/resources/experience/components/commerce_assets/popularCategory.properties

```

### Notes

This component requires a selection of a category. The merchant can change the category's display name.

By default, this component uses one of the images assigned to the category (used in slots). If the fall-back images are used, there are two fields to add inline css rules for adjusting the image display size and css positioning within the circle used to display in the isml template.

The merchant can override the image by using the image selector and choosing a focal point.

[Return to top](#Page-Designer-Components-for-Storefront-Reference-Architecture)

-------------------

## Product Tile

Shows a product in a tile and a ‘Shop Now’ overlay.

### Files
```
./cartridges/app_storefront_base/cartridge/client/default/scss/experience/components/commerceAssets/productTile.scss
./cartridges/app_storefront_base/cartridge/experience/components/commerce_assets/productTile.js
./cartridges/app_storefront_base/cartridge/experience/components/commerce_assets/productTile.json
./cartridges/app_storefront_base/cartridge/templates/default/experience/components/commerce_assets/product/productTile.isml
./cartridges/app_storefront_base/cartridge/templates/resources/productTile.properties
./cartridges/bm_app_storefront_base/cartridge/templates/resources/experience/components/commerce_assets/productTile.properties
```

### Notes

Has a product picker attribute and a boolean attribute to toggle display ratings.

[Return to top](#Page-Designer-Components-for-Storefront-Reference-Architecture)

-------------------

## Shop The Look Product Tile

Shows [Shop The Look Product Tile](#Shop-The-Look-Product-Tile) components that link to the Quick View of a product.

### Files
```
./cartridges/app_storefront_base/cartridge/client/default/scss/experience/components/commerceAssets/shopTheLook.scss
./cartridges/app_storefront_base/cartridge/experience/components/commerce_assets/shopTheLook.js
./cartridges/app_storefront_base/cartridge/experience/components/commerce_assets/shopTheLook.json
./cartridges/app_storefront_base/cartridge/templates/default/experience/components/commerce_assets/shopTheLook.isml
./cartridges/bm_app_storefront_base/cartridge/templates/resources/experience/components/commerce_assets/shopTheLook.properties
```

### Notes

Has a product picker attribute and a boolean attribute to toggle display product pricing.

[Return to top](#Page-Designer-Components-for-Storefront-Reference-Architecture)


