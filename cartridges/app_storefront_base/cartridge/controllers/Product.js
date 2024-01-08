'use strict';

/**
 * @namespace Product
 */

var server = require('server');

var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

/**
 * @typedef ProductDetailPageResourceMap
 * @type Object
 * @property {String} global_availability - Localized string for "Availability"
 * @property {String} label_instock - Localized string for "In Stock"
 * @property {String} global_availability - Localized string for "This item is currently not
 *     available"
 * @property {String} info_selectforstock - Localized string for "Select Styles for Availability"
 */

  /**
  * Product-Show : This endpoint is called to show the details of the selected product
  * @name Base/Product-Show
  * @function
  * @memberof Product
  * @param {middleware} - cache.applyPromotionSensitiveCache
  * @param {middleware} - consentTracking.consent
  * @param {querystringparameter} - pid - Product ID
  * @param {category} - non-sensitive
  * @param {renders} - isml
  * @param {serverfunction} - get
  */
server.get('Show', cache.applyPromotionSensitiveCache, consentTracking.consent, function (req, res, next) {
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var showProductPageHelperResult = productHelper.showProductPage(req.querystring, req.pageMetaData);
    var productType = showProductPageHelperResult.product.productType;
    if (!showProductPageHelperResult.product.online && productType !== 'set' && productType !== 'bundle') {
        res.setStatusCode(404);
        res.render('error/notFound');
    } else {
        var pageLookupResult = productHelper.getPageDesignerProductPage(showProductPageHelperResult.product);

        if ((pageLookupResult.page && pageLookupResult.page.hasVisibilityRules()) || pageLookupResult.invisiblePage) {
            // the result may be different for another user, do not cache on this level
            // the page itself is a remote include and can still be cached
            res.cachePeriod = 0; // eslint-disable-line no-param-reassign
        }
        if (pageLookupResult.page) {
            res.page(pageLookupResult.page.ID, {}, pageLookupResult.aspectAttributes);
        } else {
            res.render(showProductPageHelperResult.template, {
                product: showProductPageHelperResult.product,
                addToCartUrl: showProductPageHelperResult.addToCartUrl,
                resources: showProductPageHelperResult.resources,
                breadcrumbs: showProductPageHelperResult.breadcrumbs,
                canonicalUrl: showProductPageHelperResult.canonicalUrl,
                schemaData: showProductPageHelperResult.schemaData
            });
        }
    }
    next();
}, pageMetaData.computedPageMetaData);

/**
 * Product-ShowInCategory : The Product-ShowInCategory endpoint renders the product detail page within the context of a category
 * @name Base/Product-ShowInCategory
 * @function
 * @memberof Product
 * @param {middleware} - cache.applyPromotionSensitiveCache
 * @param {querystringparameter} - pid - Product ID
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('ShowInCategory', cache.applyPromotionSensitiveCache, function (req, res, next) {
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var showProductPageHelperResult = productHelper.showProductPage(req.querystring, req.pageMetaData);
    if (!showProductPageHelperResult.product.online) {
        res.setStatusCode(404);
        res.render('error/notFound');
    } else {
        res.render(showProductPageHelperResult.template, {
            product: showProductPageHelperResult.product,
            addToCartUrl: showProductPageHelperResult.addToCartUrl,
            resources: showProductPageHelperResult.resources,
            breadcrumbs: showProductPageHelperResult.breadcrumbs
        });
    }
    next();
});

/**
 * Product-Variation : This endpoint is called when all the product variants are selected
 * @name Base/Product-Variation
 * @function
 * @memberof Product
 * @param {querystringparameter} - pid - Product ID
 * @param {querystringparameter} - quantity - Quantity
 * @param {querystringparameter} - dwvar_<pid>_color - Color Attribute ID
 * @param {querystringparameter} - dwvar_<pid>_size - Size Attribute ID
 * @param {category} - non-sensitive
 * @param {returns} - json
 * @param {serverfunction} - get
 */
server.get('Variation', function (req, res, next) {
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var priceHelper = require('*/cartridge/scripts/helpers/pricing');
    var ProductFactory = require('*/cartridge/scripts/factories/product');
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');

    var params = req.querystring;
    var product = ProductFactory.get(params);

    var context = {
        price: product.price
    };

    product.price.html = priceHelper.renderHtml(priceHelper.getHtmlContext(context));

    var attributeContext = { product: { attributes: product.attributes } };
    var attributeTemplate = 'product/components/attributesPre';
    product.attributesHtml = renderTemplateHelper.getRenderedHtml(
        attributeContext,
        attributeTemplate
    );

    var promotionsContext = { product: { promotions: product.promotions } };
    var promotionsTemplate = 'product/components/promotions';

    product.promotionsHtml = renderTemplateHelper.getRenderedHtml(
        promotionsContext,
        promotionsTemplate
    );

    var optionsContext = { product: { options: product.options } };
    var optionsTemplate = 'product/components/options';

    product.optionsHtml = renderTemplateHelper.getRenderedHtml(
        optionsContext,
        optionsTemplate
    );

    res.json({
        product: product,
        resources: productHelper.getResources()
    });

    next();
});

/**
 * Product-ShowQuickView : This endpoint is called when a product quick view button is clicked
 * @name Base/Product-ShowQuickView
 * @function
 * @memberof Product
 * @param {middleware} - cache.applyPromotionSensitiveCache
 * @param {querystringparameter} - pid - Product ID
 * @param {category} - non-sensitive
 * @param {serverfunction} - get
 */
server.get('ShowQuickView', cache.applyPromotionSensitiveCache, function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var ProductFactory = require('*/cartridge/scripts/factories/product');
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
    var Resource = require('dw/web/Resource');

    var params = req.querystring;
    var product = ProductFactory.get(params);
    var addToCartUrl = URLUtils.url('Cart-AddProduct');
    var template = product.productType === 'set'
        ? 'product/setQuickView.isml'
        : 'product/quickView.isml';

    var context = {
        product: product,
        addToCartUrl: addToCartUrl,
        resources: productHelper.getResources(),
        quickViewFullDetailMsg: Resource.msg('link.quickview.viewdetails', 'product', null),
        closeButtonText: Resource.msg('link.quickview.close', 'product', null),
        enterDialogMessage: Resource.msg('msg.enter.quickview', 'product', null),
        template: template
    };

    res.setViewData(context);

    this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
        var viewData = res.getViewData();
        var renderedTemplate = renderTemplateHelper.getRenderedHtml(viewData, viewData.template);

        res.json({
            renderedTemplate: renderedTemplate,
            productUrl: URLUtils.url('Product-Show', 'pid', viewData.product.id).relative().toString()
        });
    });

    next();
});

/**
 * Product-SizeChart : This endpoint is called when the "Size Chart" link on the product details page is clicked
 * @name Base/Product-SizeChart
 * @function
 * @memberof Product
 * @param {querystringparameter} - cid - Size Chart ID
 * @param {category} - non-sensitve
 * @param {returns} - json
 * @param {serverfunction} - get
 */
server.get('SizeChart', function (req, res, next) {
    var ContentMgr = require('dw/content/ContentMgr');

    var apiContent = ContentMgr.getContent(req.querystring.cid);

    if (apiContent) {
        res.json({
            success: true,
            content: apiContent.custom.body.markup
        });
    } else {
        res.json({});
    }
    next();
});

/**
 * Product-ShowBonusProducts : This endpoint is called when a product with bonus product is added to Cart
 * @name Base/Product-ShowBonusProducts
 * @function
 * @memberof Product
 * @param {querystringparameter} - DUUID - Discount Line Item UUID
 * @param {querystringparameter} - pagesize - Number of products to show on a page
 * @param {querystringparameter} - pagestart - Starting Page Number
 * @param {querystringparameter} - maxpids - Limit maximum number of Products
 * @param {category} - non-sensitive
 * @param {returns} - json
 * @param {serverfunction} - get
 */
server.get('ShowBonusProducts', function (req, res, next) {
    var Resource = require('dw/web/Resource');
    var ProductFactory = require('*/cartridge/scripts/factories/product');
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
    var moreUrl = null;
    var pagingModel;
    var products = [];
    var product;
    var duuid = req.querystring.DUUID;
    var collections = require('*/cartridge/scripts/util/collections');
    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket = BasketMgr.getCurrentOrNewBasket();
    var showMoreButton;
    var selectedBonusProducts;

    if (duuid) {
        var bonusDiscountLineItem = collections.find(currentBasket.getBonusDiscountLineItems(), function (item) {
            return item.UUID === duuid;
        });

        if (bonusDiscountLineItem && bonusDiscountLineItem.bonusProductLineItems.length) {
            selectedBonusProducts = collections.map(bonusDiscountLineItem.bonusProductLineItems, function (bonusProductLineItem) {
                var option = {
                    optionid: '',
                    selectedvalue: ''
                };
                if (!bonusProductLineItem.optionProductLineItems.empty) {
                    option.optionid = bonusProductLineItem.optionProductLineItems[0].optionID;
                    option.optionid = bonusProductLineItem.optionProductLineItems[0].optionValueID;
                }
                return {
                    pid: bonusProductLineItem.productID,
                    name: bonusProductLineItem.productName,
                    submittedQty: (bonusProductLineItem.quantityValue),
                    option: option
                };
            });
        } else {
            selectedBonusProducts = [];
        }

        if (req.querystring.pids) {
            var params = req.querystring.pids.split(',');
            products = params.map(function (param) {
                product = ProductFactory.get({
                    pid: param,
                    pview: 'bonus',
                    duuid: duuid });
                return product;
            });
        } else {
            var URLUtils = require('dw/web/URLUtils');
            var PagingModel = require('dw/web/PagingModel');
            var pageStart = parseInt(req.querystring.pagestart, 10);
            var pageSize = parseInt(req.querystring.pagesize, 10);
            showMoreButton = true;

            var ProductSearchModel = require('dw/catalog/ProductSearchModel');
            var apiProductSearch = new ProductSearchModel();
            var productSearchHit;
            apiProductSearch.setPromotionID(bonusDiscountLineItem.promotionID);
            apiProductSearch.setPromotionProductType('bonus');
            apiProductSearch.search();
            pagingModel = new PagingModel(apiProductSearch.getProductSearchHits(), apiProductSearch.count);
            pagingModel.setStart(pageStart);
            pagingModel.setPageSize(pageSize);

            var totalProductCount = pagingModel.count;

            if (pageStart + pageSize > totalProductCount) {
                showMoreButton = false;
            }

            moreUrl = URLUtils.url('Product-ShowBonusProducts', 'DUUID', duuid, 'pagesize', pageSize, 'pagestart', pageStart + pageSize).toString();

            var iter = pagingModel.pageElements;
            while (iter !== null && iter.hasNext()) {
                productSearchHit = iter.next();
                product = ProductFactory.get({ pid: productSearchHit.getProduct().ID, pview: 'bonus', duuid: duuid });
                products.push(product);
            }
        }
    }

    var context = {
        products: products,
        selectedBonusProducts: selectedBonusProducts,
        maxPids: req.querystring.maxpids,
        moreUrl: moreUrl,
        showMoreButton: showMoreButton,
        closeButtonText: Resource.msg('link.choice.of.bonus.dialog.close', 'product', null),
        enterDialogMessage: Resource.msg('msg.enter.choice.of.bonus.select.products', 'product', null),
        template: 'product/components/choiceOfBonusProducts/bonusProducts.isml'
    };

    res.setViewData(context);

    this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
        var viewData = res.getViewData();

        res.json({
            renderedTemplate: renderTemplateHelper.getRenderedHtml(viewData, viewData.template)
        });
    });

    next();
});

module.exports = server.exports();
