var assert = require('chai').assert;
var searchHelperPath = '../../../../../cartridges/app_storefront_base/cartridge/scripts/helpers/searchHelpers';
var searchHelpers = require(searchHelperPath);
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

describe('search helpers', function () {
    describe('get category template', function () {
        it('should return a template', function () {
            var mockApiProductSearch = {
                category: {
                    template: 'rendering/category/catLanding'
                }
            };
            var categoryTemplate = searchHelpers.getCategoryTemplate(mockApiProductSearch);
            assert.equal(categoryTemplate, 'rendering/category/catLanding');
        });

        it('should return no template', function () {
            var mockApiProductSearch = { category: null };
            var categoryTemplate = searchHelpers.getCategoryTemplate(mockApiProductSearch);
            assert.equal(categoryTemplate, '');
        });
    });

    describe('getPageDesignerCategoryPage', function () {
        var searchHelpersMock;
        var catalogMgrMock;
        var pageMgrMock;
        var categoryMock;

        beforeEach(function () {
            categoryMock = {};
            catalogMgrMock = {
                getCategory: sinon.stub()
            };
            catalogMgrMock.getCategory.returns(categoryMock);

            pageMgrMock = {
                getPageByCategory: sinon.stub()
            };
            searchHelpersMock = proxyquire(searchHelperPath, {
                'dw/catalog/CatalogMgr': catalogMgrMock,
                'dw/experience/PageMgr': pageMgrMock,
                'dw/util/HashMap': function () {
                    this.isHashMap = true;
                }
            });
        });

        it('should return an object with null values, if no suitable page can be found', function () {
            pageMgrMock.getPageByCategory.returns(null);

            var result = searchHelpersMock.getPageDesignerCategoryPage('someId');
            assert.isNotNull(result);
            assert.isNull(result.page);
            assert.isNull(result.invisiblePage);
            assert.isNull(result.aspectAttributes);
            assert.isTrue(pageMgrMock.getPageByCategory.calledTwice);
        });

        it('should return only invisible page if no visible page can be found', function () {
            var invisibleMockPage = { isVisible: function () { return false; }, ID: 'invisible' };
            pageMgrMock.getPageByCategory.withArgs(categoryMock, false, 'plp').returns(invisibleMockPage);

            var result = searchHelpersMock.getPageDesignerCategoryPage('someId');
            assert.isNotNull(result);
            assert.isNull(result.page);
            assert.strictEqual(result.invisiblePage, invisibleMockPage);
            assert.isNull(result.aspectAttributes);
            assert.isTrue(pageMgrMock.getPageByCategory.calledTwice);
        });

        it('should return only a visible page and aspect attributes when it is the only page found', function () {
            var mockPage = { ID: 'mockPageId', isVisible: function () { return true; } };
            pageMgrMock.getPageByCategory.returns(mockPage);

            var result = searchHelpersMock.getPageDesignerCategoryPage('someId');
            assert.isNotNull(result);
            assert.strictEqual(result.page, mockPage);
            assert.isNull(result.invisiblePage);
            assert.isNotNull(result.aspectAttributes);
            assert.equal(result.aspectAttributes.category, categoryMock);
            assert.isTrue(result.aspectAttributes.isHashMap);
            assert.isTrue(pageMgrMock.getPageByCategory.calledTwice);
        });

        it('should return both a visible page and invisible page and aspect attributes when the pages are different', function () {
            var mockPage = { ID: 'mockPageId', isVisible: function () { return true; } };
            pageMgrMock.getPageByCategory.returns(mockPage);
            var invisibleMockPage = { isVisible: function () { return false; }, ID: 'invisible' };
            pageMgrMock.getPageByCategory.withArgs(categoryMock, false, 'plp').returns(invisibleMockPage);

            var result = searchHelpersMock.getPageDesignerCategoryPage('someId');
            assert.isNotNull(result);
            assert.strictEqual(result.page, mockPage);
            assert.strictEqual(result.invisiblePage, invisibleMockPage);
            assert.isNotNull(result.aspectAttributes);
            assert.equal(result.aspectAttributes.category, categoryMock);
            assert.isTrue(result.aspectAttributes.isHashMap);
            assert.isTrue(pageMgrMock.getPageByCategory.calledTwice);
        });
    });

    describe('setup search', function () {
        var mockApiProductSearch = {};
        var mockParams1 = { srule: 'bestsellers', cgid: 'mens' };
        var mockParams2 = { srule: 'bestsellers', cgid: 'mens', preferences: { prefn1: 'pref1Value' } };
        var mockSelectedCategory = { ID: 'mens', online: true };

        var setProductPropertiesSpy = sinon.spy();
        var addRefinementValuesSpy = sinon.spy();

        var searchHelpersMock = proxyquire(searchHelperPath, {
            'dw/catalog/CatalogMgr': {
                getSortingRule: function (srule) {
                    return srule;
                },
                getCategory: function () {
                    return mockSelectedCategory;
                }
            },
            '*/cartridge/scripts/search/search': {
                setProductProperties: setProductPropertiesSpy,
                addRefinementValues: addRefinementValuesSpy
            }
        });


        it('should call setProductProperties', function () {
            searchHelpersMock.setupSearch(mockApiProductSearch, mockParams1);
            assert.isTrue(setProductPropertiesSpy.calledWith(mockApiProductSearch, mockParams1, mockSelectedCategory, mockParams2.srule));
            assert.isTrue(addRefinementValuesSpy.notCalled);
        });

        it('should call both setProductProperties & addRefinementValues', function () {
            searchHelpersMock.setupSearch(mockApiProductSearch, mockParams2);
            assert.isTrue(setProductPropertiesSpy.calledWith(mockApiProductSearch, mockParams1, mockSelectedCategory, mockParams2.srule));
            assert.isTrue(addRefinementValuesSpy.calledWith(mockApiProductSearch, mockParams2.preferences));
        });
    });

    describe('setup content search', function () {
        var mockParams = { q: 'denim', startingPage: 0 };

        var setRecursiveFolderSearchSpy = sinon.spy();
        var setFilteredByFolderSpy = sinon.spy();
        var setSearchPhraseSpy = sinon.spy();
        var searchSpy = sinon.spy();
        var contentSearchSpy = sinon.spy();
        var searchHelpersMock2 = proxyquire(searchHelperPath, {
            'dw/content/ContentSearchModel': function () {
                return {
                    setRecursiveFolderSearch: setRecursiveFolderSearchSpy,
                    setFilteredByFolder: setFilteredByFolderSpy,
                    setSearchPhrase: setSearchPhraseSpy,
                    search: searchSpy,
                    getContent: function () {
                        return ['jeans', 'shorts'];
                    },
                    getCount: function () { return 2; }
                };
            },
            '*/cartridge/models/search/contentSearch': contentSearchSpy
        });

        searchHelpersMock2.setupContentSearch(mockParams);

        it('should set setRecursiveFolderSearch to true', function () {
            assert.isTrue(setRecursiveFolderSearchSpy.calledWith(true));
        });
        it('should set setFilteredByFolder to false', function () {
            assert.isTrue(setFilteredByFolderSpy.calledWith(false));
        });
        it('should set setSearchPhrase', function () {
            assert.isTrue(setSearchPhraseSpy.calledWith(mockParams.q));
        });
        it('should call search', function () {
            assert.isTrue(searchSpy.called);
        });
        it('should call ContentSearch', function () {
            assert.isTrue(contentSearchSpy.calledWith(['jeans', 'shorts'], 2, 'denim', 0, null));
        });
    });

    describe('applyCache', function () {
        var res = {
            cachePeriod: '',
            cachePeriodUnit: '',
            personalized: false
        };

        it('should apply cache', function () {
            searchHelpers.applyCache(res);
            assert.equal(res.cachePeriod, 1);
            assert.equal(res.cachePeriodUnit, 'hours');
            assert.isTrue(res.personalized);
        });
    });

    describe('search', function () {
        var productSearchStub = sinon.stub();
        var searchSpy = sinon.spy();
        var categoryMock = {
            parent: {
                ID: 'root'
            },
            template: 'rendering/category/categoryproducthits'
        };
        var productSearchModelMock = {
            search: searchSpy,
            getSearchRedirect: function () {
                return {
                    getLocation: function () {
                        return 'some value';
                    }
                };
            },
            category: categoryMock
        };
        var searchHelpersMock3 = proxyquire(searchHelperPath, {
            'dw/catalog/CatalogMgr': {
                getSortingOptions: function () {
                    return;
                },
                getSiteCatalog: function () {
                    return { getRoot: function () { return; } };
                },
                getSortingRule: function (rule) {
                    return rule;
                },
                getCategory: function () {
                    return { ID: 'mens', online: true };
                }
            },
            'dw/catalog/ProductSearchModel': function () {
                return productSearchModelMock;
            },
            'dw/web/URLUtils': {
                url: function () {
                    return {
                        append: function () {
                            return 'some appened URL';
                        }
                    };
                }
            },
            '*/cartridge/scripts/helpers/pageMetaHelper': {
                setPageMetaTags: function () {
                    return;
                },
                setPageMetaData: function () {
                    return;
                }
            },
            '*/cartridge/scripts/helpers/structuredDataHelper': {
                getListingPageSchema: function () {
                    return 'some schema';
                }
            },
            '*/cartridge/models/search/productSearch': productSearchStub,
            '*/cartridge/scripts/reportingUrls': {
                getProductSearchReportingURLs: function () {
                    return ['something', 'something else'];
                }
            },
            '*/cartridge/scripts/search/search': {
                setProductProperties: function () {
                    return;
                },
                addRefinementValues: function () {
                    return;
                }
            }
        });

        var res = {
            cachePeriod: '',
            cachePeriodUnit: '',
            personalized: false
        };
        var mockRequest1 = {
            querystring: {}
        };
        var mockRequest2 = { querystring: { q: 'someValue' } };
        var mockRequest3 = { querystring: { cgid: 'someCategory', preferences: 'preferences', pmin: 'pmin', pmax: 'pmax' } };

        afterEach(function () {
            productSearchStub.reset();
            searchSpy.reset();
        });

        it('should category search', function () {
            productSearchStub.returns({
                isCategorySearch: true,
                isRefinedCategorySearch: false
            });
            var result = searchHelpersMock3.search(mockRequest1, res);

            assert.isTrue(searchSpy.calledOnce);
            assert.equal(result.maxSlots, 4);
            assert.deepEqual(result.category, {
                parent: {
                    ID: 'root'
                },
                template: 'rendering/category/categoryproducthits'
            });
            assert.equal(result.categoryTemplate, 'rendering/category/categoryproducthits');
            assert.equal(result.reportingURLs.length, 2);
            assert.isDefined(result.canonicalUrl);
            assert.isDefined(result.schemaData);
        });

        it('should search', function () {
            productSearchStub.returns({
                isCategorySearch: false,
                isRefinedCategorySearch: false
            });

            categoryMock = null;

            var result = searchHelpersMock3.search(mockRequest1, res);

            assert.isTrue(searchSpy.calledOnce);
            assert.equal(result.maxSlots, 4);
            assert.equal(result.category, null);
            assert.equal(result.categoryTemplate, null);
            assert.equal(result.reportingURLs.length, 2);
        });

        it('should get a search redirect url', function () {
            var result = searchHelpersMock3.search(mockRequest2);

            assert.equal(result.searchRedirect, 'some value');
            assert.isTrue(searchSpy.notCalled);
            assert.equal(result.maxSlots, null);
        });

        it('should search with query string params', function () {
            searchHelpersMock3.search(mockRequest3, res);

            assert.isTrue(searchSpy.calledOnce);
        });
    });

    describe('backButtonDetection', function () {
        var strContainerURLUTILS = '';
        var searchHelpersMock4 = proxyquire(searchHelperPath, {
            'dw/web/URLUtils': {
                url: function (endPoint) {
                    strContainerURLUTILS += endPoint + '?';
                    return {
                        append: function (param, value) {
                            var extraChar = strContainerURLUTILS.includes('=') ? '&' : '';
                            // if(strContainerURLUTILS.includes('&')){}
                            strContainerURLUTILS += extraChar + param + '=' + value;
                            return strContainerURLUTILS;
                        },
                        toString: function () {
                            return strContainerURLUTILS;
                        }
                    };
                }
            },
            '*/cartridge/config/preferences': {
                plpBackButtonOn: true,
                plpBackButtonLimit: 10
            }
        });

        var searchHelpersMock5 = proxyquire(searchHelperPath, {
            '*/cartridge/config/preferences': {
                plpBackButtonOn: false,
                plpBackButtonLimit: 10
            }
        });

        afterEach(function () {
            strContainerURLUTILS = '';
        });
        it('should detect the old category query string', function () {
            var clickStream = {
                clicks: [
                    {
                        pipelineName: 'Foo-Bar',
                        queryString: ''
                    },
                    {
                        pipelineName: 'Search-ShowAjax',
                        queryString: 'cgid=womens-clothing-tops&prefn1=refinementColor&prefv1=Blue&start=12&sz=12&selectedUrl=qwertyuiop'
                    },
                    {
                        pipelineName: 'Product-Show',
                        queryString: 'qwertyuiopiutrewerty'
                    },
                    {
                        pipelineName: 'Search-Show',
                        queryString: 'cgid=womens-clothing-tops'
                    }]
            };
            var result = searchHelpersMock4.backButtonDetection(clickStream);
            var testURL = clickStream.clicks[0].pipelineName + '?' + clickStream.clicks[2].queryString;
            assert.equal(testURL.split('&').length, result.split('&').length);
            assert.isTrue(result.includes('start=0'));
            assert.isTrue(result.includes('sz=24'));
        });
        it('should return null if it has not found a search request after the pdp request', function () {
            var clickStream = {
                clicks: [
                    {
                        pipelineName: 'Foo-Bar',
                        queryString: ''
                    },
                    {
                        pipelineName: 'Home-Show',
                        queryString: 'cgid=womens-clothing-tops&prefn1=refinementColor&prefv1=Blue&start=12&sz=12&selectedUrl=qwertyuiop'
                    },
                    {
                        pipelineName: 'Product-Show',
                        queryString: 'qwertyuiopiutrewerty'
                    },
                    {
                        pipelineName: 'Search-Show',
                        queryString: 'cgid=womens-clothing-tops'
                    }]
            };

            var result = searchHelpersMock4.backButtonDetection(clickStream);
            assert.equal(result, null);
        });

        it('should return null if it has found 2 search request in a row', function () {
            var clickStream = {
                clicks: [
                    {
                        pipelineName: 'Foo-Bar',
                        queryString: ''
                    },
                    {
                        pipelineName: 'Product-Show',
                        queryString: 'qwertyuiopiutrewerty'
                    },
                    {
                        pipelineName: 'Search-UpdateGrid',
                        queryString: 'q=shirts&prefn1=refinementColor&prefv1=Blue&start=12&sz=12&selectedUrl=qwertyuiop'
                    },
                    {
                        pipelineName: 'Search-Show',
                        queryString: 'q=shirts'
                    }]
            };

            var result = searchHelpersMock4.backButtonDetection(clickStream);
            assert.equal(result, null);
        });

        it('should return null if prefernces.plpBackButtonOn is falsy', function () {
            var clickStream = {
                clicks: [
                    {
                        pipelineName: 'Foo-Bar',
                        queryString: ''
                    },
                    {
                        pipelineName: 'Search-UpdateGrid',
                        queryString: 'q=shirts&prefn1=refinementColor&prefv1=Blue&start=12&sz=12&selectedUrl=qwertyuiop'
                    },
                    {
                        pipelineName: 'Product-Show',
                        queryString: 'qwertyuiopiutrewerty'
                    },
                    {
                        pipelineName: 'Search-Show',
                        queryString: 'q=shirts'
                    }]
            };

            var result = searchHelpersMock5.backButtonDetection(clickStream);
            assert.equal(result, null);
        });

        it('should return a redirect url with the old search request paramters', function () {
            var clickStream = {
                clicks: [
                    {
                        pipelineName: 'Foo-Bar',
                        queryString: ''
                    },
                    {
                        pipelineName: 'Search-UpdateGrid',
                        queryString: 'q=shirts&prefn1=refinementColor&prefv1=Blue&start=12&sz=12&selectedUrl=qwertyuiop'
                    },
                    {
                        pipelineName: 'Product-Show',
                        queryString: 'qwertyuiopiutrewerty'
                    },
                    {
                        pipelineName: 'Search-Show',
                        queryString: 'q=shirts'
                    }]
            };

            var result = searchHelpersMock4.backButtonDetection(clickStream);
            var testURL = clickStream.clicks[0].pipelineName + '?' + clickStream.clicks[2].queryString;
            assert.equal(testURL.split('&').length, result.split('&').length);
            assert.isTrue(result.includes('start=0'));
            assert.isTrue(result.includes('sz=24'));
        });

        it('should return null if q does not match between search calls', function () {
            var clickStream = {
                clicks: [
                    {
                        pipelineName: 'Foo-Bar',
                        queryString: ''
                    },
                    {
                        pipelineName: 'Search-UpdateGrid',
                        queryString: 'q=shirts&prefn1=refinementColor&prefv1=Blue&start=12&sz=12&selectedUrl=qwertyuiop'
                    },
                    {
                        pipelineName: 'Product-Show',
                        queryString: 'qwertyuiopiutrewerty'
                    },
                    {
                        pipelineName: 'Search-Show',
                        queryString: 'q=pants'
                    }]
            };

            var result = searchHelpersMock4.backButtonDetection(clickStream);
            assert.equal(result, null);
        });
    });

    describe('.getBannerImageUrl()', function () {
        var slotImageUrl = 'http://slot.banner.image.url';
        var nonSlotImageUrl = 'http://image.url';
        var category;

        beforeEach(function () {
            category = {
                custom: {
                    slotBannerImage: {
                        getURL: function () {
                            return slotImageUrl;
                        }
                    }
                },
                image: {
                    getURL: function () {
                        return nonSlotImageUrl;
                    }
                }
            };
        });

        it('should use a slot image for a category banner if specified', function () {
            assert.equal(searchHelpers.getBannerImageUrl(category), slotImageUrl);
        });

        it('should use a regular image for its banner image if no slot image specified', function () {
            category.custom = null;
            assert.equal(searchHelpers.getBannerImageUrl(category), nonSlotImageUrl);
        });
    });
});
