'use strict';
/* global request, response */

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

/**
 * Render logic for the product list page.
 *
 * @param {dw.experience.PageScriptContext} context The page script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commcerce Cloud Plattform.
 *
 * @returns {string} The markup to be displayed
 */
module.exports.render = function (context, modelIn) {
    var model = modelIn || new HashMap();
    var page = context.page;
    model.page = page;

    var content = context.content;
    if (content.category) {
        var categoryId = content.category.ID;

        var ProductSearchModel = require('dw/catalog/ProductSearchModel');
        var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');
        var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
        var URLUtils = require('dw/web/URLUtils');

        var apiProductSearch = new ProductSearchModel();
        var params = { cgid: categoryId };
        apiProductSearch = searchHelper.setupSearch(apiProductSearch, params);

        // we do not need to execute the search, that is handled by a component, we just need the meta tags
        pageMetaHelper.setPageMetaTags(request.pageMetaData, apiProductSearch);
        model.canonicalUrl = URLUtils.url('Search-Show', 'cgid', categoryId);
    }

    // automatically register configured regions
    model.regions = PageRenderHelper.getRegionModelRegistry(page);

    if (PageRenderHelper.isInEditMode()) {
        var HookManager = require('dw/system/HookMgr');
        HookManager.callHook('app.experience.editmode', 'editmode');
        model.resetEditPDMode = true;
    }

    // instruct 24 hours relative pagecache as default
    // this might be adjusted by the components used within the page
    var expires = new Date();
    expires.setDate(expires.getDate() + 1); // this handles overflow automatically
    response.setExpires(expires);

    model.CurrentPageMetaData = PageRenderHelper.getPageMetaData(page);

    // render the page
    return new Template('experience/pages/threeRowStorePage').render(model).text;
};
