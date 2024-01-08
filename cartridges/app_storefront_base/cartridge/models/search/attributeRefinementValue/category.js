'use strict';

var BaseAttributeValue = require('*/cartridge/models/search/attributeRefinementValue/base');

var ACTION_ENDPOINT = 'Search-ShowAjax';

/**
 * @constructor
 * @classdesc Category attribute refinement value model
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - ProductSearchModel instance
 * @param {dw.catalog.ProductSearchRefinementDefinition} refinementDefinition - Refinement
 *     definition
 * @param {dw.catalog.Category} category - a Category instance
 * @param {boolean} selected - Selected flag
 */
function CategoryAttributeValue(productSearch, refinementDefinition, category, selected) {
    this.productSearch = productSearch;
    this.refinementDefinition = refinementDefinition;
    this.category = category;
    this.subCategories = [];
    this.selected = selected;

    this.initialize();
}

CategoryAttributeValue.prototype = Object.create(BaseAttributeValue.prototype);

CategoryAttributeValue.prototype.initialize = function () {
    this.type = 'category';
    this.selectable = true;
    this.id = this.category.ID;
    this.actionEndpoint = ACTION_ENDPOINT;

    this.displayValue = this.category.displayName;

    this.url = this.getUrl(
        this.productSearch,
        this.actionEndpoint,
        this.id,
        this.value,
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

CategoryAttributeValue.prototype.getUrl = function (
    productSearch,
    actionEndpoint,
    id,
    value,
    selected) {
    var url = '';

    if (selected) {
        if (productSearch.category && productSearch.category.parent) {
            url = productSearch
                .urlRefineCategory(actionEndpoint, productSearch.category.parent.ID)
                .relative()
                .toString();
        } else {
            url = productSearch.urlRefineCategory(actionEndpoint, id).relative().toString();
        }
    } else {
        url = productSearch.urlRefineCategory(actionEndpoint, id).relative().toString();
    }

    return url;
};

/**
 * @constructor
 * @classdesc Category attribute refinement value model
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - ProductSearchModel instance
 * @param {dw.catalog.ProductSearchRefinementDefinition} refinementDefinition - Refinement
 *     definition
 * @param {dw.catalog.Category} category - a Category instance
 * @param {boolean} selected - Selected flag
 */
function CategoryRefinementValueWrapper(
    productSearch,
    refinementDefinition,
    category,
    selected) {
    var value = new CategoryAttributeValue(
        productSearch,
        refinementDefinition,
        category,
        selected
    );
    var items = [
        'id',
        'type',
        'displayValue',
        'selected',
        'selectable',
        'title',
        'url',
        'subCategories'
    ];
    items.forEach(function (item) {
        this[item] = value[item];
    }, this);
}

module.exports = CategoryRefinementValueWrapper;
