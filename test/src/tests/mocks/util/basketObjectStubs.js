const BasketMgr = require('../BasketMgr');
const ProductMgr = require('../dw.catalog.ProductMgr');
const sinon = require('sinon');

const basketStubs = () => {
    const basketManagerMock = new BasketMgr();
    const currentBasket = basketManagerMock.getCurrentBasket();
    const lineItems = currentBasket.getProductLineItems().toArray();
    const basketProduct = ProductMgr.getProduct();
    const currentProductID = basketProduct.ID;

    let captureProductOptionStub = sinon.stub();
    let prepareProductObjStub = sinon.stub();
    let captureBonusProductStub = sinon.stub();
    let captureBundleProductStub = sinon.stub();
    let priceCheckStub = sinon.stub();

    const bundleOpts = lineItems[0].bundledProductLineItems;
    const bonusOpts = lineItems[0].bonusProductLineItem;
    const productOpts = lineItems[0].optionProductLineItems;

    const pdctLineItems = captureProductOptionStub.withArgs(productOpts).returns(productOpts);
    const prepProduct = prepareProductObjStub.withArgs(lineItems[0], basketProduct, currentProductID).returns(basketProduct);
    const bonusPdct = captureBonusProductStub.withArgs(bonusOpts, basketProduct).returns(basketProduct);
    const bundlePdct = captureBundleProductStub.withArgs(bundleOpts[0]).returns(bundleOpts[0]);
    const priceCheckMock = priceCheckStub.withArgs(lineItems[0], basketProduct).returns('$10.00');

    return {
        productOpts: productOpts,
        pdctLineItems: pdctLineItems,
        prepProduct: prepProduct,
        bonusPdct: bonusPdct,
        bundlePdct: bundlePdct,
        priceCheckMock: priceCheckMock
    };
};

module.exports = basketStubs;
