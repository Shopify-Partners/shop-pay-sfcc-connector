'use strict';

/* global response */

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

/**
 * Render logic for the product list component
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commerce Cloud Platform.
 *
 * @returns {string} The markup to be displayed
 */
module.exports.render = function (context, modelIn) {
    var model = modelIn || new HashMap();

    var component = context.component;
    model.component = component;
    model.regions = PageRenderHelper.getRegionModelRegistry(component);
    var content = context.content;
    model.categoryId = content.category.getID();

    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var ProductSearchModel = require('dw/catalog/ProductSearchModel');
    var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');
    var ProductSearch = require('*/cartridge/models/search/productSearch');

    var apiProductSearch = new ProductSearchModel();
    var params = { cgid: model.categoryId };
    apiProductSearch = searchHelper.setupSearch(apiProductSearch, params);
    var sortingRule = apiProductSearch.category.defaultSortingRule.ID;
    apiProductSearch.search();

    var productSearch = new ProductSearch(
        apiProductSearch,
        params,
        sortingRule,
        CatalogMgr.getSortingOptions(),
        CatalogMgr.getSiteCatalog().getRoot()
    );
    model.productSearch = productSearch;
    model.apiProductSearch = apiProductSearch;
    model.maxSlots = 4;

    // Component Regions
    var gridCol = '4';
    if (content.displayFormat && content.displayFormat.value === 'row') {
        gridCol = '12';
    }
    model.gridClassName = 'region col-6 col-sm-' + gridCol;
    model.isEditMode = PageRenderHelper.isInEditMode();

    // instruct 1 hour relative pagecache
    var expires = new Date();
    expires.setHours(expires.getHours() + 1);
    response.setExpires(expires);
    response.setVaryBy('price_promotion');

    return new Template('experience/components/dynamic/productList/productList.isml').render(model).text;
};
