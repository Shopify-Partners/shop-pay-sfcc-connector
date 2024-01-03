'use strict';
/* global response */

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var collections = require('*/cartridge/scripts/util/collections');

/**
 * Render logic for the storefront.shopTheLook component
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commerce Cloud Platform.
 *
 * @returns {string} The markup to be displayed
 */
module.exports.render = function (context, modelIn) {
    var model = modelIn || new HashMap();

    var content = context.content;

    // assemble component configuration in serializable manner
    var serializableModel = {
        productID: context.content.product.ID,
        pview: 'tile',
        display: {
            swatches: true,
            ratings: content.displayRatings
        },
        quickViewText: content.quickView,
        displayPrice: content.priceDisplay
    };

    // attach all parameters coming through the modelIn extension
    collections.forEach(model.keySet(), function (key) {
        serializableModel[key] = model.get(key);
    });

    var remoteModel = new HashMap();
    remoteModel.data = JSON.stringify(serializableModel);

    // instruct 24 hours relative pagecache
    var expires = new Date();
    expires.setDate(expires.getDate() + 1); // this handles overflow automatically
    response.setExpires(expires);
    // no need for vary-by as the template is rendered as remote include

    return new Template('experience/components/commerce_assets/shopTheLook/remoteShopTheLook').render(remoteModel).text;
};
