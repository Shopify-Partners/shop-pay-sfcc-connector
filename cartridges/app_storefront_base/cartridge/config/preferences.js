'use strict';

// TODO: wire minTermLength to cartridges/app_storefront_base/cartridge/client/default/js/components/search.js
// minTermLength value here should be the same as minChars at line # 5 in search.js
// should also be in sync with BM > Merchant Tools >  Search >  Search Indexes > Language Options
// default is set to 1 but can be edited upto a value of 5 as in BM

module.exports = {
    maxOrderQty: 10,
    defaultPageSize: 12,
    plpBackButtonOn: true,
    plpBackButtonLimit: 10,
    minTermLength: 1
};
