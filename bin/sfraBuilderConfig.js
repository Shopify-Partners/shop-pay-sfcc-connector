/* eslint-disable max-len */
const path = require('path');

/**
 * Allows us to configure aliases for require
 */
module.exports.aliasConfig = {
    // enter all aliases to configure
    alias: {
        home: path.resolve(
            process.cwd()
        ),
        base: path.resolve(
            process.cwd(),
            './storefront-reference-architecture/cartridges/app_storefront_base/cartridge/client/default/'
        ),
    },
}

/**
 * Exposes cartridges included in the project
 * TODO: Get these programmatically
 */
module.exports.cartridges = [
    './storefront-reference-architecture/cartridges/app_storefront_base',
    './cartridges/int_shoppay_core',
]
