/* eslint-disable no-undef */
"use strict";

const path = require("path");

/**
 * Allows to configure aliases for you require loading
 */
module.exports.aliasConfig = {
    // enter all aliases to configure
    alias: {
        base: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            "storefront-reference-architecture/cartridges/app_storefront_base/cartridge/client/default/"
        ),
    },
};

/**
 * Allows copying files to static folder
 */
module.exports.copyConfig = {
    "storefront-reference-architecture/cartridges/app_storefront_base": [
        { from: "storefront-reference-architecture/node_modules/font-awesome/fonts/", to: "default/fonts" },
        { from: "storefront-reference-architecture/node_modules/flag-icon-css/flags", to: "default/fonts/flags" },
    ],
};

/**
 * Allows custom include path config
 */
module.exports.includeConfig = {
    "storefront-reference-architecture/cartridges/app_storefront_base": {
        scss: ["my-custom-node_modules"],
    },
};

/**
 * Allows excluding js files for compile
 */
module.exports.excludeJS = {
    "": [],
};

/**
 * Exposes cartridges included in the project
 */
module.exports.cartridges = [
    "storefront-reference-architecture/cartridges/app_storefront_base",
    // "plugin_wishlists/cartridges/plugin_wishlists",
    "cartridges/int_shoppay",
    "cartridges/int_shoppay_sfra",
];

/**
 * Lint options
 */
module.exports.lintConfig = {
    eslintFix: true,
    stylelintFix: true,
};
