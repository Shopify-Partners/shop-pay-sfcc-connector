const ShippingMgr = require('../dw.order.ShippingMgr.js');
const sinon = require('sinon');

const paymentStubs = () => {
    const defaultShippingMethod = ShippingMgr.getDefaultShippingMethod()

    return {
        defaultShippingMethod: defaultShippingMethod
    }
}
