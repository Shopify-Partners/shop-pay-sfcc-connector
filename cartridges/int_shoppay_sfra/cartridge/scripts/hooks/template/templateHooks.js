'use strict';

var ISML = require('dw/template/ISML');

/**
 * Renders app.template.htmlHead hook content
 * @param {Object} pdict Parameters from the template
 */
function htmlHead(pdict) {
    var includeShopPayJS = true;//pdict.includeShopPayJS; // update logic for A/B testing to render script tag on all pages
    if (includeShopPayJS) {
        ISML.renderTemplate('/components/header/shopPayScriptsIncludes');
    }
}

exports.htmlHead = htmlHead;