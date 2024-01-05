'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var mockCollections = require('../../../../mocks/util/collections');
var Collection = require('../../../../mocks/dw.util.Collection');

var stubGetProduct = sinon.stub();
var stubCategoryMock = sinon.stub();
var stubProductFactoryGet = sinon.stub();
var stubGetPage = sinon.stub();

var categoryMock = {
    displayName: 'some name',
    ID: 'some ID',
    parent: {
        ID: 'root'
    }
};

var stubSearchModel = sinon.stub();

describe('Helpers - Product', function () {
    var productHelpers = proxyquire(
        '../../../../../cartridges/app_storefront_base/cartridge/scripts/helpers/productHelpers', {
            '*/cartridge/scripts/util/collections': mockCollections,
            '*/cartridge/scripts/helpers/urlHelpers': {
                appendQueryParams: function () { return 'some url'; }
            },
            'dw/campaign/PromotionMgr': {
                activeCustomerPromotions: {
                    getProductPromotions: function () { return 'promotions'; }
                }
            },
            'dw/web/URLUtils': {
                url: function () { return 'some url'; }
            },
            '*/cartridge/scripts/factories/product': {
                get: stubProductFactoryGet
            },
            '*/cartridge/scripts/helpers/pageMetaHelper': {
                setPageMetaData: function () {},
                setPageMetaTags: function () {}
            },
            '*/cartridge/scripts/helpers/structuredDataHelper': {
                getProductSchema: function () { return 'schema'; }
            },
            'dw/web/Resource': {
                msg: function () {
                    return 'some string';
                }
            },
            'dw/catalog/CatalogMgr': {
                getCategory: stubCategoryMock
            },
            'dw/catalog/ProductSearchModel': stubSearchModel,
            'dw/catalog/ProductMgr': {
                getProduct: stubGetProduct
            },
            'dw/experience/PageMgr': {
                getPageByProduct: stubGetPage,
                getPageByCategory: stubGetPage
            },
            'dw/util/HashMap': function () {
                this.isHashMap = true;
            }
        });

    var productMock = {};
    var setSelectedAttributeValueSpy = sinon.spy();
    beforeEach(function () {
        productMock.variationModel = {
            master: false,
            selectedVariant: false,
            productVariationAttributes: [{
                ID: 'color',
                displayName: 'Color'
            }],
            getAllValues: function () {
                return new Collection([{
                    value: 'blue',
                    ID: 'blue'
                }]);
            },
            setSelectedAttributeValue: setSelectedAttributeValueSpy,
            getSelectedVariant: function () {}
        };
    });
    var optionValue1Mock = {
        ID: 'value1',
        displayValue: 'Value 1'
    };
    var optionValue2Mock = {
        ID: 'value2',
        displayValue: 'Value 2'
    };
    var optionValuesMock = [optionValue1Mock, optionValue2Mock];
    var option1Mock = {
        ID: 'option1',
        displayName: 'Option 1',
        htmlName: 'Option 1 html',
        optionValues: []
    };

    var selectedOptionMock = {
        optionId: option1Mock.ID,
        selectedValueId: optionValue1Mock.ID
    };
    var selectedOptionsMock = [selectedOptionMock];

    var optionValuePrice1Mock = {
        decimalValue: 4.56,
        toFormattedString: function () { return '$4.56'; }
    };
    var optionValuePrice2Mock = {
        decimalValue: 1.23,
        toFormattedString: function () { return '$1.23'; }
    };

    var getPriceStub = sinon.stub();
    getPriceStub.onFirstCall().returns(optionValuePrice1Mock)
        .onSecondCall().returns(optionValuePrice2Mock);

    var setSelectedOptionValueStub = sinon.spy();
    var selectedValueMock = { id: 'anything' };
    var optionModelMock = {
        options: [option1Mock],
        getPrice: getPriceStub,
        getOptionValue: function () { return selectedValueMock; },
        getSelectedOptionValue: function () {
            return optionValue1Mock;
        },
        setSelectedOptionValue: setSelectedOptionValueStub,
        urlSelectOptionValue: function () {
            return {
                toString: function () { return 'some url'; }
            };
        }
    };

    var optionProductLineItemsMock = [
        {
            optionID: 'optionId1',
            optionValueID: 'selectedValueId1',
            productName: 'productName1'
        },
        {
            optionID: 'optionId2',
            optionValueID: 'selectedValueId2',
            productName: 'productName2'
        }
    ];

    describe('showProductPage() function', function () {
        var renderSpy = sinon.spy();
        var res = { render: renderSpy };
        var apiProductMock = {
            variant: true,
            masterProduct: {
                primaryCategory: categoryMock
            },
            primaryCategoryMock: categoryMock
        };

        beforeEach(function () {
            stubProductFactoryGet.reset();
            stubGetProduct.reset();
            renderSpy.reset();
        });

        it('should return a with product/productDetails template', function () {
            var prodMock = { productType: 'variant', id: '12345' };

            stubProductFactoryGet.returns(prodMock);
            stubGetProduct.returns(apiProductMock);

            var result = productHelpers.showProductPage({}, {});
            assert.equal(result.template, 'product/productDetails');
            assert.equal(result.resources.info_selectforstock, 'some string');
        });

        it('should return with canonicalUrl', function () {
            var prodMock = { productType: 'variant', id: '12345' };

            stubProductFactoryGet.returns(prodMock);
            stubGetProduct.returns(apiProductMock);

            var result = productHelpers.showProductPage({}, {});
            assert.equal(result.canonicalUrl, 'some url');
        });

        it('should return with product schema json', function () {
            var prodMock = { productType: 'variant', id: '12345' };

            stubProductFactoryGet.returns(prodMock);
            stubGetProduct.returns(apiProductMock);

            var result = productHelpers.showProductPage({}, {});
            assert.equal(result.schemaData, 'schema');
        });

        it('should with product/bundleDetails template', function () {
            var prodMock = { productType: 'bundle', id: 'bundle' };

            stubProductFactoryGet.returns(prodMock);
            stubGetProduct.returns(apiProductMock);

            productHelpers.showProductPage({}, {});

            var result = productHelpers.showProductPage({}, {});
            assert.equal(result.template, 'product/bundleDetails');
        });

        it('should return with product/setDetails template', function () {
            var prodMock = { productType: 'set', id: 'set' };

            stubProductFactoryGet.returns(prodMock);
            stubGetProduct.returns(apiProductMock);

            productHelpers.showProductPage({}, {}, res);

            var result = productHelpers.showProductPage({}, {});
            assert.equal(result.template, 'product/setDetails');
        });
    });

    describe('getPageDesignerProductPage() function', function () {
        var printSpy = sinon.spy();
        var res = { print: printSpy };

        this.beforeEach(function () {
            printSpy.reset();
            stubGetPage.reset();
            stubGetPage.resetBehavior();
        });

        it('should not return a page when the product has an individual template', function () {
            var result = productHelpers.getPageDesignerProductPage({ template: 'some/template' }, res);
            assert.isNotNull(result);
            assert.isNull(result.page);
            assert.isNull(result.invisiblePage);
            assert.isNull(result.aspectAttributes);
            assert.isFalse(stubGetPage.called);
        });

        it('should return an object with null values, if no suitable page can be found', function () {
            stubGetPage.returns(null);

            var result = productHelpers.getPageDesignerProductPage({ id: 'someID', raw: { variant: false, primaryCategory: categoryMock } }, res);
            assert.isNotNull(result);
            assert.isNull(result.page);
            assert.isNull(result.invisiblePage);
            assert.isNull(result.aspectAttributes);
            assert.equal(stubGetPage.callCount, 4);
        });

        it('should return only invisible category page if no visible category page can be found', function () {
            var invisibleMockPage = { isVisible: function () { return false; }, ID: 'invisible' };
            stubGetPage.withArgs(categoryMock, false, 'pdp').returns(invisibleMockPage);

            var result = productHelpers.getPageDesignerProductPage({ id: 'someID', raw: { variant: false, primaryCategory: categoryMock } }, res);
            assert.isNotNull(result);
            assert.isNull(result.page);
            assert.strictEqual(result.invisiblePage, invisibleMockPage);
            assert.isNull(result.aspectAttributes);
            assert.equal(stubGetPage.callCount, 4);
        });

        it('should return category page if just an invisible product page can be found', function () {
            var mockPage = { ID: 'mockPageId', isVisible: function () { return true; } };
            stubGetPage.returns(mockPage);

            var invisibleMockPage = { isVisible: function () { return false; }, ID: 'invisible' };
            var mockProduct = { variant: false, primaryCategory: categoryMock };
            stubGetPage.withArgs(mockProduct, true, 'pdp').returns(null);
            stubGetPage.withArgs(mockProduct, false, 'pdp').returns(invisibleMockPage);

            var result = productHelpers.getPageDesignerProductPage({ id: 'someID', raw: mockProduct }, res);
            assert.isNotNull(result);
            assert.strictEqual(result.page, mockPage);
            assert.strictEqual(result.invisiblePage, invisibleMockPage);
            assert.isNotNull(result.aspectAttributes);
            assert.equal(result.aspectAttributes.category, categoryMock);
            assert.equal(result.aspectAttributes.product, mockProduct);
            assert.isTrue(result.aspectAttributes.isHashMap);
            assert.equal(stubGetPage.callCount, 3);
        });

        it('should return only a visible category page and aspect attributes when it is the only page found', function () {
            var mockPage = { ID: 'mockPageId', isVisible: function () { return true; } };
            stubGetPage.returns(mockPage);

            var mockProduct = { variant: false, primaryCategory: categoryMock };
            stubGetPage.withArgs(mockProduct, true, 'pdp').returns(null);
            stubGetPage.withArgs(mockProduct, false, 'pdp').returns(null);

            var result = productHelpers.getPageDesignerProductPage({ id: 'someID', raw: mockProduct }, res);
            assert.isNotNull(result);
            assert.strictEqual(result.page, mockPage);
            assert.isNull(result.invisiblePage);
            assert.isNotNull(result.aspectAttributes);
            assert.equal(result.aspectAttributes.category, categoryMock);
            assert.equal(result.aspectAttributes.product, mockProduct);
            assert.isTrue(result.aspectAttributes.isHashMap);
            assert.equal(stubGetPage.callCount, 4);
        });

        it('should return only a visible product page and aspect attributes when it is the only page found', function () {
            var mockPage = { ID: 'mockPageId', isVisible: function () { return true; } };
            stubGetPage.returns(mockPage);

            var mockProduct = { variant: false, primaryCategory: categoryMock };
            stubGetPage.withArgs(mockProduct, true, 'pdp').returns(mockPage);

            var result = productHelpers.getPageDesignerProductPage({ id: 'someID', raw: mockProduct }, res);
            assert.isNotNull(result);
            assert.strictEqual(result.page, mockPage);
            assert.isNull(result.invisiblePage);
            assert.isNotNull(result.aspectAttributes);
            assert.equal(result.aspectAttributes.category, categoryMock);
            assert.equal(result.aspectAttributes.product, mockProduct);
            assert.isTrue(result.aspectAttributes.isHashMap);
            assert.isTrue(stubGetPage.calledTwice);
        });

        it('should return both a visible category page and invisible category page and aspect attributes when the pages are different', function () {
            var mockPage = { ID: 'mockPageId', isVisible: function () { return true; } };
            stubGetPage.returns(mockPage);
            var invisibleMockPage = { isVisible: function () { return false; }, ID: 'invisible' };
            stubGetPage.withArgs(categoryMock, false, 'pdp').returns(invisibleMockPage);

            var mockProduct = { variant: false, primaryCategory: categoryMock };
            stubGetPage.withArgs(mockProduct, true, 'pdp').returns(null);
            stubGetPage.withArgs(mockProduct, false, 'pdp').returns(null);

            var result = productHelpers.getPageDesignerProductPage({ id: 'someID', raw: mockProduct }, res);
            assert.isNotNull(result);
            assert.strictEqual(result.page, mockPage);
            assert.strictEqual(result.invisiblePage, invisibleMockPage);
            assert.isNotNull(result.aspectAttributes);
            assert.equal(result.aspectAttributes.category, categoryMock);
            assert.equal(result.aspectAttributes.product, mockProduct);
            assert.isTrue(result.aspectAttributes.isHashMap);
            assert.equal(stubGetPage.callCount, 4);
        });

        it('should use the primary category of a simple product', function () {
            stubGetPage.returns(null);

            var mockProduct = { variant: false, primaryCategory: categoryMock };
            stubGetPage.withArgs(mockProduct, true, 'pdp').returns(null);
            stubGetPage.withArgs(mockProduct, false, 'pdp').returns(null);

            productHelpers.getPageDesignerProductPage({ id: 'someID', raw: mockProduct }, res);
            assert.equal(stubGetPage.callCount, 4);
            assert.isTrue(stubGetPage.calledWith(categoryMock, true, 'pdp'));
            assert.isTrue(stubGetPage.calledWith(categoryMock, false, 'pdp'));
            assert.isTrue(stubGetPage.calledWith(mockProduct, true, 'pdp'));
            assert.isTrue(stubGetPage.calledWith(mockProduct, false, 'pdp'));
        });

        it('should use the master products primary category for a variation product', function () {
            stubGetPage.returns(null);

            var mockProduct = { variant: false, primaryCategory: categoryMock };
            stubGetPage.withArgs(mockProduct, true, 'pdp').returns(null);
            stubGetPage.withArgs(mockProduct, false, 'pdp').returns(null);

            productHelpers.getPageDesignerProductPage({ id: 'someID', raw: mockProduct }, res);
            assert.equal(stubGetPage.callCount, 4);
            assert.isTrue(stubGetPage.calledWith(categoryMock, true, 'pdp'));
            assert.isTrue(stubGetPage.calledWith(categoryMock, false, 'pdp'));
            assert.isTrue(stubGetPage.calledWith(mockProduct, true, 'pdp'));
            assert.isTrue(stubGetPage.calledWith(mockProduct, false, 'pdp'));
        });

        it('should use the classification category of a simple product without primary category', function () {
            stubGetPage.returns(null);

            var mockProduct = { variant: false, primaryCategory: categoryMock };
            stubGetPage.withArgs(mockProduct, true, 'pdp').returns(null);
            stubGetPage.withArgs(mockProduct, false, 'pdp').returns(null);

            productHelpers.getPageDesignerProductPage({ id: 'someID', raw: mockProduct }, res);
            assert.equal(stubGetPage.callCount, 4);
            assert.isTrue(stubGetPage.calledWith(categoryMock, true, 'pdp'));
            assert.isTrue(stubGetPage.calledWith(categoryMock, false, 'pdp'));
            assert.isTrue(stubGetPage.calledWith(mockProduct, true, 'pdp'));
            assert.isTrue(stubGetPage.calledWith(mockProduct, false, 'pdp'));
        });

        it('should use the master products classification category for a variation product, if the master has no primary category', function () {
            stubGetPage.returns(null);

            var mockProduct = { variant: false, primaryCategory: categoryMock };
            stubGetPage.withArgs(mockProduct, true, 'pdp').returns(null);
            stubGetPage.withArgs(mockProduct, false, 'pdp').returns(null);

            productHelpers.getPageDesignerProductPage({ id: 'someID', raw: mockProduct }, res);
            assert.equal(stubGetPage.callCount, 4);
            assert.isTrue(stubGetPage.calledWith(categoryMock, true, 'pdp'));
            assert.isTrue(stubGetPage.calledWith(categoryMock, false, 'pdp'));
            assert.isTrue(stubGetPage.calledWith(mockProduct, true, 'pdp'));
            assert.isTrue(stubGetPage.calledWith(mockProduct, false, 'pdp'));
        });
    });

    describe('getAllBreadcrumbs() function', function () {
        beforeEach(function () {
            stubGetProduct.reset();
            stubCategoryMock.reset();
        });

        it('should return breadcrumbs empty', function () {
            var apiProductMock = {
                variant: true,
                masterProduct: {
                    primaryCategory: categoryMock
                },
                primaryCategoryMock: categoryMock
            };

            stubGetProduct.returns(apiProductMock);

            var result = productHelpers.getAllBreadcrumbs(null, null, []);
            assert.equal(result.length, 0);
        });

        it('should return breadcrumbs with length 1', function () {
            var apiProductMock = {
                variant: false,
                masterProduct: {
                    primaryCategory: categoryMock
                },
                primaryCategoryMock: categoryMock
            };

            stubGetProduct.returns(apiProductMock);
            stubCategoryMock.returns(categoryMock);

            var result = productHelpers.getAllBreadcrumbs('cgid', null, []);
            assert.equal(result.length, 1);
            assert.equal(result[0].htmlValue, 'some name');
            assert.equal(result[0].url, 'some url');
        });
    });

    describe('getCurrentOptionModel() function', function () {
        it('should set the selected option value on the product option model', function () {
            var currentOptionModel = productHelpers.getCurrentOptionModel(optionModelMock,
                selectedOptionsMock);
            assert.isTrue(setSelectedOptionValueStub.calledWith(option1Mock, selectedValueMock));
            assert.deepEqual(currentOptionModel, optionModelMock);
        });
    });

    describe('getOptions() function', function () {
        it('should return product options', function () {
            var options = productHelpers.getOptions(optionModelMock);
            var expected = [{
                id: 'option1',
                name: 'Option 1',
                htmlName: 'Option 1 html',
                values: [],
                selectedValueId: 'value1'
            }];
            assert.deepEqual(options, expected);
        });
    });

    describe('getOptionValues() function', function () {
        it('should return a product option\'s value sorted by price', function () {
            var optionValues = productHelpers.getOptionValues(optionModelMock, option1Mock,
                optionValuesMock);
            var expected = [{
                id: 'value2',
                displayValue: 'Value 2',
                price: '$1.23',
                priceValue: 1.23,
                url: 'some url'
            }, {
                id: 'value1',
                displayValue: 'Value 1',
                price: '$4.56',
                priceValue: 4.56,
                url: 'some url'
            }];
            assert.deepEqual(optionValues, expected);
        });
    });

    describe('getSelectedOptionsUrl() function', function () {
        it('should return a url', function () {
            var url = productHelpers.getSelectedOptionsUrl(optionModelMock);
            assert.equal(url, 'some url');
        });
    });

    describe('getProductType() function', function () {
        beforeEach(function () {
            productMock = {};
        });
        it('should return type master', function () {
            productMock.master = true;
            var productType = productHelpers.getProductType(productMock);
            assert.equal(productType, 'master');
        });
        it('should return type variant', function () {
            productMock.variant = true;
            var productType = productHelpers.getProductType(productMock);
            assert.equal(productType, 'variant');
        });
        it('should return type standard product', function () {
            var productType = productHelpers.getProductType(productMock);
            assert.equal(productType, 'standard');
        });
    });

    describe('getVariationModel() function', function () {
        it('should return null', function () {
            var vModel = productHelpers.getVariationModel(productMock);
            assert.equal(vModel, null);
        });
        it('should return same variationModel Instance', function () {
            productMock.variationModel.master = true;
            productMock.variationModel.selectedVariant = true;
            var vModel = productHelpers.getVariationModel(productMock);
            assert.deepEqual(vModel, productMock.variationModel);
        });
        it('should call setSelectedAttributeValue function', function () {
            productMock.variationModel.master = true;
            productMock.variationModel.selectedVariant = true;
            var productVariablesMock = {
                color: {
                    value: 'blue'
                }
            };
            productHelpers.getVariationModel(productMock, productVariablesMock);
            assert.isTrue(setSelectedAttributeValueSpy.calledWith('color', 'blue'));
        });
    });

    describe('getConfig function', function () {
        var params = {};
        beforeEach(function () {
            productMock.variationModel.master = true;
            productMock.master = true;
            productMock.optionModel = {
                options: 'someoption'
            };
            var productVariablesMock = {
                color: {
                    value: 'blue'
                }
            };
            params.variables = productVariablesMock;
            params.options = [];
            params.quantity = 1;
        });

        it('should return config object', function () {
            var config = productHelpers.getConfig(productMock, params);
            var expectedConfig = {
                variationModel: productMock.variationModel,
                options: params.options,
                optionModel: productMock.optionModel,
                promotions: 'promotions',
                quantity: params.quantity,
                variables: params.variables,
                apiProduct: productMock,
                productType: 'master'
            };
            assert.deepEqual(config, expectedConfig);
        });
    });

    describe('getLineItemOptions function', function () {
        var productIdMock = 'someProductId';
        it('should return lineItemOptions object', function () {
            var options = productHelpers.getLineItemOptions(optionProductLineItemsMock, productIdMock);
            var expectedOptions = [
                {
                    productId: 'someProductId',
                    optionId: 'optionId1',
                    selectedValueId: 'selectedValueId1'
                },
                {
                    productId: 'someProductId',
                    optionId: 'optionId2',
                    selectedValueId: 'selectedValueId2'
                }
            ];
            assert.deepEqual(options, expectedOptions);
        });
    });

    describe('getDefaultOptions function', function () {
        var optionsMock = [
            {
                displayName: 'displayName1'
            },
            {
                displayName: 'displayName2'
            }
        ];
        it('should return defaultOption object', function () {
            var options = productHelpers.getDefaultOptions(optionModelMock, optionsMock);
            var expectedOptions = [
                'displayName1: Value 1', 'displayName2: Value 1'
            ];
            assert.deepEqual(options, expectedOptions);
        });
    });

    describe('getLineItemOptionNames function', function () {
        it('should return defaultOption object', function () {
            var options = productHelpers.getLineItemOptionNames(optionProductLineItemsMock);
            var expectedOptions = [
                {
                    'displayName': 'productName1',
                    'optionId': 'optionId1',
                    'selectedValueId': 'selectedValueId1'
                },
                {
                    'displayName': 'productName2',
                    'optionId': 'optionId2',
                    'selectedValueId': 'selectedValueId2'
                }
            ];
            assert.deepEqual(options, expectedOptions);
        });
    });

    describe('getAllBreadcrumbs() function', function () {
        afterEach(function () {
            stubSearchModel.reset();
        });

        it('should return the search hit from the search', function () {
            stubSearchModel.returns({
                setSearchPhrase: function () {},
                search: function () {},
                getProductSearchHit: function () { return 'hit'; },
                getProductSearchHits: function () {
                    return {
                        next: function () {
                            return { firstRepresentedProductID: 'someID' };
                        }
                    };
                },
                count: 1
            });

            var result = productHelpers.getProductSearchHit({ ID: 'someID' });
            assert.equal(result, 'hit');
        });
    });
});
