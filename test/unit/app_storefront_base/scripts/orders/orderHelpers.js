'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('orderHelpers', function () {
    describe('getLastOrder', function () {
        it('should return an order model', function () {
            var orderHelpers = proxyquire('../../../../../cartridges/app_storefront_base/cartridge/scripts/order/orderHelpers', {
                '*/cartridge/models/order': function () {
                    return {
                        id: 'order ID 123'
                    };
                },
                'dw/order/OrderMgr': {},
                'dw/order/Order': {
                    ORDER_STATUS_REPLACED: 'yes'
                },
                'dw/web/Resource': {},
                'dw/web/URLUtils': {},
                'dw/util/Locale': {
                    getLocale: function () {
                        return {
                            country: 'US'
                        };
                    }
                }
            });

            var req = {
                currentCustomer: {
                    raw: {
                        getOrderHistory: function () {
                            return {
                                getOrders: function () {
                                    return {
                                        first: function () {
                                            return {
                                                id: 'order ID 123'
                                            };
                                        }
                                    };
                                }
                            };
                        }
                    },
                    profile: {
                        customerNo: '12345678'
                    }
                },
                locale: {
                    id: 'en_US'
                }
            };

            var orderModel = orderHelpers.getLastOrder(req);
            assert.equal(orderModel.id, 'order ID 123');
        });

        it('should return null if no order', function () {
            var orderHelpers = proxyquire('../../../../../cartridges/app_storefront_base/cartridge/scripts/order/orderHelpers', {
                '*/cartridge/models/order': function () {
                    return null;
                },
                'dw/order/OrderMgr': {},
                'dw/order/Order': {
                    ORDER_STATUS_REPLACED: 'yes'
                },
                'dw/web/Resource': {},
                'dw/web/URLUtils': {},
                'dw/util/Locale': {
                    getLocale: function () {
                        return {
                            country: 'US'
                        };
                    }
                }
            });

            var req = {
                currentCustomer: {
                    raw: {
                        getOrderHistory: function () {
                            return {
                                getOrders: function () {
                                    return {
                                        first: function () {
                                            return null;
                                        }
                                    };
                                }
                            };
                        }
                    },
                    profile: {
                        customerNo: '12345678'
                    }
                },
                locale: {
                    id: 'en_US'
                }
            };

            var orderModel = orderHelpers.getLastOrder(req);
            assert.isNull(orderModel);
        });
    });

    describe('getOrderDetails', function () {
        it('should return an order model with order details', function () {
            var orderHelpers = proxyquire('../../../../../cartridges/app_storefront_base/cartridge/scripts/order/orderHelpers', {
                '*/cartridge/models/order': function () {
                    return {
                        id: 'order ID 12345678'
                    };
                },
                'dw/order/OrderMgr': {
                    getOrder: function () {
                        return;
                    }
                },
                'dw/order/Order': {
                    ORDER_STATUS_REPLACED: 'yes'
                },
                'dw/web/Resource': {},
                'dw/web/URLUtils': {},
                'dw/util/Locale': {
                    getLocale: function () {
                        return {
                            country: 'US'
                        };
                    }
                }
            });

            var req = {
                querystring: {
                    orderID: '12345678'
                },
                locale: {
                    id: 'en_US'
                }
            };

            var orderModel = orderHelpers.getOrderDetails(req);
            assert.equal(orderModel.id, 'order ID 12345678');
        });
    });
});
