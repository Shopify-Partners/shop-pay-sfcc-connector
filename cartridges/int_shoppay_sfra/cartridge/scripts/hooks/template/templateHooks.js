'use strict';

/* API Includes */
var ISML = require('dw/template/ISML');

/**
 * Renders app.template.htmlHead hook content
 * @param {Object} pdict Parameters from the template
 */
function htmlHead(pdict) {
    if (pdict.includeShopPayJS) {
        ISML.renderTemplate('/components/header/shoppayScriptsIncludes');
    }
}

exports.htmlHead = htmlHead;