'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('emailHelper: Validate Email', function () {
    var emailHelpers = proxyquire('../../../../../cartridges/app_storefront_base/cartridge/scripts/helpers/emailHelpers', {
    });

    it('should return true for valid email', function () {
        var result = emailHelpers.validateEmail('JaneSmith@abc.com');
        assert.isTrue(result);
    });

    it('should return false for email without @', function () {
        var result = emailHelpers.validateEmail('JaneSmith');
        assert.isFalse(result);
    });

    it('should return false for email without .', function () {
        var result = emailHelpers.validateEmail('JaneSmith@abc');
        assert.isFalse(result);
    });
});
