/**
 *  This script creates a base implementation to handle configurable theming options within SFRA.
 *  It is an extensible anchor point for more elaborate implementations and can be overwritten by plugins and custom implementation
 */

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');

var ContentMgr = require('dw/content/ContentMgr');

/**
 *  This function is called within the html head and renders its output there.
 *  It gathers either a css file from a content asset for external skin.css or the body element inline for quicker critical css introduction
 *  @returns {string} text to be rendered
 */
exports.renderSkin = function renderSkin() {
    // get content asset
    var contentAsset = ContentMgr.getContent('store-skin');
    var renderParameters = new HashMap();
    if (contentAsset) {
        // check for file or inline css
        if (contentAsset.custom.customCSSFile) {
            renderParameters.type = 'FILE';
            renderParameters.url = contentAsset.custom.customCSSFile.getURL();
        } else {
            renderParameters.type = 'INLINE';
            renderParameters.markup = contentAsset.custom.body;
        }
        var template = new Template('components/skin');
        return template.render(renderParameters).text;
    }
    // render nothing if no skin is maintained in custom installation
    return '';
};
