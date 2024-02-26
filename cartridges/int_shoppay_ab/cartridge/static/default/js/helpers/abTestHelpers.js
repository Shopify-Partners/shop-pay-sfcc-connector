/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./cartridges/int_shoppay_ab/cartridge/client/default/js/helpers/abTestHelpers.js":
/*!****************************************************************************************!*\
  !*** ./cartridges/int_shoppay_ab/cartridge/client/default/js/helpers/abTestHelpers.js ***!
  \****************************************************************************************/
/***/ ((module) => {



/**
 * Gets the value of a specified cookie
 * @param {string} cname - cookie name
 * @returns {string} - value of a specified cookie
 */
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var _i = 0; _i < ca.length; _i++) {
    var c = ca[_i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

/**
 * Set a Cookie
 * @param {string} cname - cookie name
 * @param {string} cvalue - cookie value
 * @param {string} expDays - days until cookie expires
 */
function setCookie(cname, cvalue, expDays) {
  var date = new Date();
  date.setTime(date.getTime() + expDays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + date.toUTCString();
  document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";
}

/**
 * Gets the shoppayAB test cookie and converts it to a 
 * JSON object
 * @returns {object | undefined} - abCookie json object or undefined
 */
function parseABTestCookie() {
  var abCookie = getCookie('shoppayAB');
  if (abCookie) {
    return JSON.parse(abCookie);
  }
  return;
}
module.exports = {
  getCookie: getCookie,
  setCookie: setCookie,
  parseABTestCookie: parseABTestCookie
};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./cartridges/int_shoppay_ab/cartridge/client/default/js/helpers/abTestHelpers.js");
/******/ 	
/******/ })()
;
//# sourceMappingURL=abTestHelpers.js.map