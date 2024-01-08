'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('carouselBuilder', function () {
    var carouselBuilder = proxyquire('../../../../../../cartridges/app_storefront_base/cartridge/scripts/experience/utilities/carouselBuilder.js', {
        '*/cartridge/experience/utilities/PageRenderHelper.js': {
            getRegionModelRegistry: function () {
                var returnValue = {
                    container: {},
                    slides: {
                        setClassName: function () {},
                        setComponentClassName: function () {},
                        region: [1, 2]
                    }
                };
                returnValue.slides.region.size = 2;

                returnValue.slides.setComponentAttribute = function () {

                };
                return returnValue;
            }
        }
    });

    it('should build a carousel', function () {
        var model = {};
        var context = {
            content: {
                xsCarouselSlidesToDisplay: 1,
                smCarouselSlidesToDisplay: 2,
                mdCarouselSlidesToDisplay: 3,
                xsCarouselControls: true,
                smCarouselControls: true,
                xsCarouselIndicators: true,
                smCarouselIndicators: true,
                mdCarouselIndicators: true
            },
            component: {
                typeID: 'storefront.einsteinCarouselCategory',
                getID: function () {}
            }
        };
        var result = carouselBuilder.init(model, context);
        assert.property(result, 'regions');
        assert.property(result, 'id');
        assert.property(result, 'slidesToDisplay');
        assert.property(result, 'displayIndicators');
        assert.property(result, 'displayControls');
        assert.property(result, 'insufficientNumberOfSlides');
        assert.property(result, 'numberOfSlides');
        assert.property(result, 'title');
    });

    it('should build a carousel without slides to display properties', function () {
        var model = {};
        var context = {
            content: {
                xsCarouselSlidesToDisplay: null,
                smCarouselSlidesToDisplay: null,
                mdCarouselSlidesToDisplay: null,
                xsCarouselControls: false,
                smCarouselControls: false,
                xsCarouselIndicators: false,
                smCarouselIndicators: false,
                mdCarouselIndicators: false
            },
            component: {
                typeID: 'storefront.einsteinCarouselCategory',
                getID: function () {}
            }
        };
        var result = carouselBuilder.init(model, context);
        assert.property(result, 'regions');
        assert.property(result, 'id');
        assert.property(result, 'slidesToDisplay');
        assert.property(result, 'displayIndicators');
        assert.property(result, 'displayControls');
        assert.property(result, 'insufficientNumberOfSlides');
        assert.property(result, 'numberOfSlides');
        assert.property(result, 'title');
    });

    it('should build a carousel with category based recs', function () {
        var model = {};
        var context = {
            content: {
                xsCarouselSlidesToDisplay: 1,
                smCarouselSlidesToDisplay: 2,
                mdCarouselSlidesToDisplay: 3
            },
            component: {
                typeID: 'storefront.einsteinCarouselCategory',
                getID: function () {}
            }
        };
        var result = carouselBuilder.init(model, context);
        assert.property(result, 'regions');
        assert.property(result, 'id');
        assert.property(result, 'slidesToDisplay');
        assert.property(result, 'displayIndicators');
        assert.property(result, 'displayControls');
        assert.property(result, 'insufficientNumberOfSlides');
        assert.property(result, 'numberOfSlides');
        assert.property(result, 'title');
    });

    it('should build a carousel with product based recs', function () {
        var model = {};
        var context = {
            content: {
                xsCarouselSlidesToDisplay: 1,
                smCarouselSlidesToDisplay: 2,
                mdCarouselSlidesToDisplay: 3
            },
            component: {
                typeID: 'storefront.einsteinCarouselProduct',
                getID: function () {}
            }
        };
        var result = carouselBuilder.init(model, context);
        assert.property(result, 'regions');
        assert.property(result, 'id');
        assert.property(result, 'slidesToDisplay');
        assert.property(result, 'displayIndicators');
        assert.property(result, 'displayControls');
        assert.property(result, 'insufficientNumberOfSlides');
        assert.property(result, 'numberOfSlides');
        assert.property(result, 'title');
    });

    it('should build a carousel', function () {
        var model = {};
        var context = {
            content: {
                xsCarouselSlidesToDisplay: 1,
                smCarouselSlidesToDisplay: 2,
                mdCarouselSlidesToDisplay: 3
            },
            component: {
                typeID: 'storefront.einsteinCarousel',
                getID: function () {}
            }
        };
        var result = carouselBuilder.init(model, context);
        assert.property(result, 'regions');
        assert.property(result, 'id');
        assert.property(result, 'slidesToDisplay');
        assert.property(result, 'displayIndicators');
        assert.property(result, 'displayControls');
        assert.property(result, 'insufficientNumberOfSlides');
        assert.property(result, 'numberOfSlides');
        assert.property(result, 'title');
    });
});
