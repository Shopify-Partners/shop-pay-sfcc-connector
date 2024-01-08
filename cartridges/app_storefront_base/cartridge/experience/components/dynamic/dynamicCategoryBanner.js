'use strict';
/* global response */

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var ImageTransformation = require('*/cartridge/experience/utilities/ImageTransformation.js');
var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');

/**
 * Render logic for dynamicBanner component.
 * @param {dw.experience.ComponentScriptContext} context The component script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commerce Cloud Platform.
 *
 * @returns {string} The markup to be displayed
 */
module.exports.render = function (context, modelIn) {
    var model = modelIn || new HashMap();
    var content = context.content;

    if (content.product && !(content.heading && content.image)) {
        var product = content.product;
        content.category = product.variant
                ? product.masterProduct.primaryCategory
                : product.primaryCategory;
        if (!content.category) {
            content.category = product.variant
                ? product.masterProduct.classificationCategory
                : product.classificationCategory;
        }
    }
    if (!content.category && !(content.heading && content.image)) {
        // this will not work, we are missing data. We throw an error to cause a 'placeholder' and a console error in PD.
        var Resource = require('dw/web/Resource');
        throw new Error(Resource.msg('pd.categoryBanner.error', 'pageDesigner', null));
    }
    if (content.heading) {
        model.heading = content.heading;
    } else {
        model.heading = content.category ? content.category.getDisplayName() : '';
    }
    var replaceImage = content.image ? ImageTransformation.getScaledImage(content.image) : null;
    model.imageUrl = replaceImage ? replaceImage.src.desktop : searchHelper.getBannerImageUrl(content.category);

    // instruct 24 hours relative pagecache
    var expires = new Date();
    expires.setDate(expires.getDate() + 1); // this handles overflow automatically
    response.setExpires(expires);

    return new Template('experience/components/commerce_assets/categoryBanner').render(model).text;
};
