/* eslint-disable no-undef */
window.jQuery = window.$ = require("jquery");
var processInclude = require("./util");

$(document).ready(function () {
    processInclude(require("../../../../../int_shoppay/cartridge/client/default/js/main"));
    processInclude(require("./components/test"));
});
