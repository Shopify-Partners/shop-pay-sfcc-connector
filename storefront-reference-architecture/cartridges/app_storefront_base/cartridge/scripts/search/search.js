'use strict';

/**
 * Sets the relevant product search model properties, depending on the parameters provided
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search object
 * @param {Object} httpParams - Query params
 * @param {dw.catalog.Category} selectedCategory - Selected category
 * @param {dw.catalog.SortingRule} sortingRule - Product grid sort rule
 * @param {Object} httpParameterMap - Query params
 * @property {Double} [httpParameterMap.pmin] - Minimum Price
 * @property {Double} [httpParameterMap.pmax] - Maximum Price
 */
function setProductProperties(productSearch, httpParams, selectedCategory, sortingRule, httpParameterMap) {
    var searchPhrase;

    if (httpParams.q) {
        searchPhrase = httpParams.q;
        productSearch.setSearchPhrase(searchPhrase);
    }
    if (selectedCategory) {
        productSearch.setCategoryID(selectedCategory.ID);
    }
    if (httpParams.pid) {
        productSearch.setProductIDs([httpParams.pid]);
    }
    if (httpParameterMap) {
        if (httpParameterMap.pmin) {
            productSearch.setPriceMin(httpParameterMap.pmin.doubleValue);
        }
        if (httpParameterMap.pmax) {
            productSearch.setPriceMax(httpParameterMap.pmax.doubleValue);
        }
    }
    if (httpParams.pmid) {
        productSearch.setPromotionID(httpParams.pmid);
    }

    if (sortingRule) {
        productSearch.setSortingRule(sortingRule);
    }

    productSearch.setRecursiveCategorySearch(true);
}

/**
 * Updates the search model with the preference refinement values
 *
 * @param {dw.catalog.SearchModel} search - SearchModel instance
 * @param {Object} preferences - Query params map
 */
function addRefinementValues(search, preferences) {
    Object.keys(preferences).forEach(function (key) {
        search.addRefinementValues(key, preferences[key]);
    });
}

module.exports = {
    addRefinementValues: addRefinementValues,
    setProductProperties: setProductProperties
};
