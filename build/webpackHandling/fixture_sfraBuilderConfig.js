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
      "./test/fixtures/cartridge/client/default/"
    ),
  },
};

/**
 * Allows excluding js files for compile
 */
module.exports.excludeJS = {
  "./test/fixtures": [
    "filesToBeExcluded.js",
  ],
};

/**
 * Exposes cartridges included in the project
 */
module.exports.cartridges = ["./test/fixtures"];
