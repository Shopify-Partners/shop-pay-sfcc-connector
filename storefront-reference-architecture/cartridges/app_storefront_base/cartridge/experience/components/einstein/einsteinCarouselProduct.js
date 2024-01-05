'use strict';
/* global response */

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
var carouselBuilder = require('*/cartridge/scripts/experience/utilities/carouselBuilder.js');
var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');

/**
 * Render logic for the storefront.einsteinCarouselProduct.
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commerce Cloud Platform.
 *
 * @returns {string} The markup to be displayed
 */
module.exports.render = function (context, modelIn) {
    var model = modelIn || new HashMap();
    var content = context.content;

    var product = context.content.product;
    if (product) {
        model.secondaryProductId = '';
        model.alternativeGroupType = '';
        model.alternativeGroupId = '';
        model.primaryProductId = (product.variant || product.variationGroup) ? product.variationModel.master.ID : product.ID;
        if (product.variant || product.variationGroup) {
            model.secondaryProductId = product.ID;
        }

        if (product.variationGroup || product.bundle || product.productSet) {
            if (product.productSet) {
                model.alternativeGroupType = 'set';
            } else if (product.bundle) {
                model.alternativeGroupType = 'bundle';
            } else if (product.variationGroup) {
                model.alternativeGroupType = 'vgroup';
            }

            model.alternativeGroupId = product.ID;
        }
    }
    model = carouselBuilder.init(model, context);
    model.textHeadline = content.textHeadline ? content.textHeadline : null;
    model.displayRatings = context.content.displayRatings;
    model.swatches = true;

    model.regions = PageRenderHelper.getRegionModelRegistry(context.component);

    var recommender = content.recommender;
    model.limit = parseInt(content.count, 10) || 1;

    if (recommender) {
        model.recommender = recommender.value;
    } else {
        throw new Error(Resource.msg('pd.no.prods.error', 'error', null));
    }

    model.productLoadUrl = URLUtils.abs('EinsteinCarousel-Load');

    model.id = 'carousel-' + PageRenderHelper.safeCSSClass(context.component.getID());

    // instruct 24 hours relative pagecache
    var expires = new Date();
    expires.setDate(expires.getDate() + 1); // this handles overflow automatically
    response.setExpires(expires);

    return new Template('experience/components/einstein/einsteinCarousel').render(model).text;
};
