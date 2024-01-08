'use strict';
/* global response */

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var URLUtils = require('dw/web/URLUtils');
var ImageTransformation = require('*/cartridge/experience/utilities/ImageTransformation.js');

/**
 * Render logic for the storefront.popularCategories.
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commerce Cloud Platform.
 *
 * @returns {string} The markup to be displayed
 */
module.exports.render = function (context, modelIn) {
    var model = modelIn || new HashMap();
    var content = context.content;
    model.textHeadline = content.textHeadline;

    var catObj = {};
    var cat = content.category;
    if (cat) {
        catObj.ID = cat.ID;
        catObj.compID = context.component.ID;

        if (content.catDisplayName) {
            catObj.name = content.catDisplayName;
        } else {
            catObj.name = cat.displayName;
        }

        if (cat.custom.slotBannerImage) {
            catObj.imageURL = cat.custom.slotBannerImage.getURL().toString();
        }

        if (cat.image) {
            catObj.imageURL = cat.image.getURL().toString();
        }

        if (content.offset) {
            catObj.offset = content.offset;
        }

        if (content.imagesize) {
            catObj.imagesize = content.imagesize;
        }

        if (content.image) {
            model.image = ImageTransformation.getScaledImage(content.image);
            catObj.imageURL = null;
        } else {
            content.image = null;
        }

        catObj.url = cat.custom && 'alternativeUrl' in cat.custom && cat.custom.alternativeUrl
            ? cat.custom.alternativeUrl
            : URLUtils.url('Search-Show', 'cgid', cat.getID()).toString();
    }

    model.category = catObj;

    // instruct 24 hours relative pagecache
    var expires = new Date();
    expires.setDate(expires.getDate() + 1); // this handles overflow automatically
    response.setExpires(expires);

    return new Template('experience/components/commerce_assets/popularCategory').render(model).text;
};
