/* eslint-env es6 */
'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var ArrayList = require('../../../../mocks/dw.util.Collection');

describe('addressHelpers', function () {
    var addressHelpers = proxyquire('../../../../../cartridges/app_storefront_base/cartridge/scripts/helpers/addressHelpers', {
        'dw/system/Transaction': {
            wrap: function (arg) { arg(); }
        },
        '*/cartridge/scripts/util/collections': proxyquire('../../../../../cartridges/app_storefront_base/cartridge/scripts/util/collections', {
            'dw/util/ArrayList': ArrayList
        })
    });

    it('Should generate correct address name', function () {
        var address = {
            address1: '10 Test St.',
            city: 'Testville',
            postalCode: '12345'
        };

        var name = addressHelpers.generateAddressName(address);

        assert.equal(name, '10 Test St. - Testville - 12345');
    });

    it('Should generate correct address with missing information', function () {
        var address = {
            address1: '10 Test St.',
            postalCode: '12345'
        };

        var name = addressHelpers.generateAddressName(address);

        assert.equal(name, '10 Test St. -  - 12345');
    });

    it('Should check if address is already stored', function () {
        var address = {
            firstName: 'Foo',
            lastName: 'Bar',
            address1: '10 Test St.',
            postalCode: '12345'
        };

        var addresses = [{
            firstName: 'Foo',
            lastName: 'Bar',
            address1: '10 Test St.',
            postalCode: '12345'
        }];

        assert.isTrue(addressHelpers.checkIfAddressStored(address, addresses));
    });

    it('Should report address as not stored', function () {
        var address = {
            firstName: 'Foo',
            lastName: 'Bar',
            address1: '10 Test St.',
            postalCode: '12345'
        };

        var addresses = [{
            firstName: 'Foo',
            lastName: 'Baz',
            address1: '10 Test St.',
            postalCode: '12345'
        }, {
            firstName: 'Fu',
            lastName: 'Bar',
            address1: '10 Test St.',
            postalCode: '12345'
        }, {
            firstName: 'Foo',
            lastName: 'Bar',
            address1: '10 Test St.'
        }, {
            firstName: 'Foo',
            lastName: 'Bar',
            address1: '10 Test St',
            postalCode: '12345'
        }];

        assert.isFalse(addressHelpers.checkIfAddressStored(address, addresses));
    });

    it('Should store an address', function () {
        var address = {
            firstName: 'Foo',
            lastName: 'Bar',
            address1: '10 Test St.',
            city: 'Testville',
            postalCode: '12345',
            phone: '123456789',
            country: 'US'
        };

        var result = {};

        var customer = {
            raw: {
                getProfile: function () {
                    return {
                        getAddressBook: function () {
                            return {
                                createAddress: function (id) {
                                    result.id = id;
                                    return new Proxy({}, {
                                        get(target, name) {
                                            return function (value) {
                                                var propName = name.substr(3, name.length - 3);
                                                var formattedName = propName.charAt(0).toLowerCase() + propName.slice(1);
                                                result[formattedName] = value;
                                            };
                                        }
                                    });
                                }
                            };
                        }
                    };
                }
            }
        };

        addressHelpers.saveAddress(address, customer, 'TestID');

        assert.equal(result.firstName, 'Foo');
        assert.equal(result.lastName, 'Bar');
        assert.equal(result.address1, '10 Test St.');
        assert.equal(result.city, 'Testville');
        assert.equal(result.postalCode, '12345');
        assert.equal(result.phone, '123456789');
        assert.equal(result.countryCode, 'US');
    });

    it('Should copy an address', function () {
        var address = {
            firstName: 'Foo',
            lastName: 'Bar',
            address1: '10 Test St.',
            city: 'Testville',
            postalCode: '12345',
            phone: '123456789',
            countryCode: 'US'
        };

        var result = addressHelpers.copyShippingAddress(address);

        assert.equal(result.firstName, 'Foo');
        assert.equal(result.lastName, 'Bar');
        assert.equal(result.address1, '10 Test St.');
        assert.equal(result.city, 'Testville');
        assert.equal(result.postalCode, '12345');
        assert.equal(result.phone, '123456789');
        assert.equal(result.country, 'US');
    });

    it('Should update an address', function () {
        var stubSetAddress1 = sinon.stub();
        var stubSetAddress2 = sinon.stub();
        var stubSetCity = sinon.stub();
        var stubSetFirstName = sinon.stub();
        var stubSetLastName = sinon.stub();
        var stubSetPhone = sinon.stub();
        var stubSetPostalCode = sinon.stub();
        var stubSetStateCode = sinon.stub();
        var stubSetCountryCode = sinon.stub();
        var stubSetJobTitle = sinon.stub();
        var stubSetPostBox = sinon.stub();
        var stubSetSalutation = sinon.stub();
        var stubSetSecondName = sinon.stub();
        var stubSetCompanyName = sinon.stub();
        var stubSetSuffix = sinon.stub();
        var stubSetSuite = sinon.stub();
        var stubSetTitle = sinon.stub();

        var address = {
            firstName: 'Foo',
            lastName: 'Bar',
            address1: '10 Test St.',
            city: 'Testville',
            postalCode: '12345',
            phone: '123456789',
            countryCode: 'US',
            setAddress1: stubSetAddress1,
            setAddress2: stubSetAddress2,
            setCity: stubSetCity,
            setFirstName: stubSetFirstName,
            setLastName: stubSetLastName,
            setPhone: stubSetPhone,
            setPostalCode: stubSetPostalCode,
            setStateCode: stubSetStateCode,
            setCountryCode: stubSetCountryCode,
            setJobTitle: stubSetJobTitle,
            setPostBox: stubSetPostBox,
            setSalutation: stubSetSalutation,
            setSecondName: stubSetSecondName,
            setCompanyName: stubSetCompanyName,
            setSuffix: stubSetSuffix,
            setSuite: stubSetSuite,
            setTitle: stubSetTitle
        };

        var formInfo = {
            address1: '11 Test ave.',
            address2: 'apt #4',
            city: '11 Test ave.',
            firstName: 'Bar',
            lastName: 'Foo',
            phone: '987654321',
            postalCode: '54321',
            states: {
                stateCode: 'MA'
            },
            country: 'US'

        };

        addressHelpers.updateAddressFields(address, formInfo);
        assert.isTrue(stubSetAddress1.calledOnce);
        assert.isTrue(stubSetAddress2.calledOnce);
        assert.isTrue(stubSetCity.calledOnce);
        assert.isTrue(stubSetFirstName.calledOnce);
        assert.isTrue(stubSetLastName.calledOnce);
        assert.isTrue(stubSetPhone.calledOnce);
        assert.isTrue(stubSetPostalCode.calledOnce);
        assert.isTrue(stubSetStateCode.calledOnce);
        assert.isTrue(stubSetCountryCode.calledOnce);
        assert.isTrue(stubSetJobTitle.calledOnce);
        assert.isTrue(stubSetPostBox.calledOnce);
        assert.isTrue(stubSetStateCode.calledOnce);
        assert.isTrue(stubSetSalutation.calledOnce);
        assert.isTrue(stubSetSecondName.calledOnce);
        assert.isTrue(stubSetCompanyName.calledOnce);
        assert.isTrue(stubSetSuffix.calledOnce);
        assert.isTrue(stubSetSuite.calledOnce);
        assert.isTrue(stubSetTitle.calledOnce);
    });

    it('Should gather all shipping addresses into one array', function () {
        var address1 = {
            firstName: 'Foo',
            lastName: 'Bar',
            address1: '10 Test St.',
            city: 'Testville',
            postalCode: '12345',
            phone: '123456789',
            countryCode: 'US'
        };
        var address2 = {
            firstName: 'Foo2',
            lastName: 'Bar2',
            address1: '102 Test St.',
            city: 'Testville',
            postalCode: '12345',
            phone: '123456789',
            countryCode: 'US'
        };
        var order = {
            shipments: new ArrayList([
                {
                    shippingAddress: address1
                },
                {
                    shippingAddress: address2
                }
            ])
        };
        var allAddresses = addressHelpers.gatherShippingAddresses(order);

        assert.equal(allAddresses[0].firstName, address1.firstName);
        assert.equal(allAddresses[0].lastName, address1.lastName);
        assert.equal(allAddresses[0].address1, address1.address1);
        assert.equal(allAddresses[1].lastName, address2.lastName);
        assert.equal(allAddresses[1].address1, address2.address1);
    });

    it('Should return default shipment address as an array when there are no other shipments', function () {
        var address = {
            firstName: 'Foo',
            lastName: 'Bar',
            address1: '10 Test St.',
            city: 'Testville',
            postalCode: '12345',
            phone: '123456789',
            countryCode: 'US'
        };
        var order = {
            defaultShipment: {
                shippingAddress: address
            }
        };
        var allAddresses = addressHelpers.gatherShippingAddresses(order);

        assert.equal(allAddresses[0].firstName, address.firstName);
        assert.equal(allAddresses[0].lastName, address.lastName);
        assert.equal(allAddresses[0].address1, address.address1);
    });
});
