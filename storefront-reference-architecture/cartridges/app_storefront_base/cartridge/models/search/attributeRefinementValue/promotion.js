'use strict';

var BaseAttributeValue = require('*/cartridge/models/search/attributeRefinementValue/base');

/**
 * @constructor
 * @classdesc Promotion refinement value model
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - ProductSearchModel instance
 * @param {dw.catalog.ProductSearchRefinementDefinition} refinementDefinition - Refinement
 *     definition
 * @param {dw.catalog.ProductSearchRefinementValue} refinementValue - Raw DW refinement value
 */
function PromotionAttributeValue(productSearch, refinementDefinition, refinementValue) {
    this.productSearch = productSearch;
    this.refinementDefinition = refinementDefinition;
    this.refinementValue = refinementValue;

    this.initialize();
}

PromotionAttributeValue.prototype = Object.create(BaseAttributeValue.prototype);

PromotionAttributeValue.prototype.initialize = function () {
    BaseAttributeValue.prototype.initialize.call(this);
    this.type = 'promotion';
    this.displayValue = this.getDisplayValue(this.refinementValue);
    this.selected = this.isSelected(
        this.productSearch,
        this.refinementValue.value
    );
    this.url = this.getUrl(
        this.productSearch,
        this.actionEndpoint,
        this.refinementValue.value,
        this.selected,
        this.selectable
    );
    this.title = this.getTitle(
        this.selected,
        this.selectable,
        this.refinementDefinition.displayName,
        this.displayValue
    );
};

PromotionAttributeValue.prototype.getUrl = function (productSearch, actionEndpoint, promotionID, selected, selectable) {
    var url = '';

    if (selected) {
        url = productSearch.urlRelaxPromotion(actionEndpoint)
            .relative().toString();
    } else if (!selectable) {
        url = '#';
    } else {
        url = productSearch.urlRefinePromotion(actionEndpoint, promotionID)
            .relative().toString();
    }

    return url;
};

PromotionAttributeValue.prototype.isSelected = function (productSearch, promotionID) {
    return productSearch.isRefinedByPromotion(promotionID);
};

/**
 * @constructor
 * @classdesc Promotion refinement value model
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - ProductSearchModel instance
 * @param {dw.catalog.ProductSearchRefinementDefinition} refinementDefinition - Refinement
 *     definition
 * @param {dw.catalog.ProductSearchRefinementValue} refinementValue - Raw DW refinement value
 * @param {boolean} selected - Selected flag
 */
function PromotionRefinementValueWrapper(
    productSearch,
    refinementDefinition,
    refinementValue,
    selected) {
    var value = new PromotionAttributeValue(
        productSearch,
        refinementDefinition,
        refinementValue,
        selected
    );
    var items = [
        'id',
        'type',
        'displayValue',
        'selected',
        'selectable',
        'title',
        'url'
    ];
    items.forEach(function (item) {
        this[item] = value[item];
    }, this);
}

module.exports = PromotionRefinementValueWrapper;
