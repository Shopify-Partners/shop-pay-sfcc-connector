var PriceBook = require('../mocks/dw.catalog.PriceBook');

var PriceBookMgr = function () {};

var testPriceBooks = [new PriceBook('testPriceBook1', 110), new PriceBook('testPriceBook1', 100)];

PriceBookMgr.getPriceBook = function () {};
PriceBookMgr.getAllPriceBooks = function () { return testPriceBooks; };
PriceBookMgr.getSitePriceBooks = function () { return testPriceBooks; };
PriceBookMgr.prototype.priceBook = null;
PriceBookMgr.prototype.allPriceBooks = null;
PriceBookMgr.prototype.sitePriceBooks = null;

module.exports = PriceBookMgr;
