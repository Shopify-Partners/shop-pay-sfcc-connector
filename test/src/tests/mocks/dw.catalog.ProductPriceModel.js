const Money = require('../mocks/dw.value.Money');

class ProductPriceModel {
    constructor() {
        this.price = new Money(20, 'USD');
        this.maxPrice = new Money(75, 'USD');
    }
    getMaxPrice() {
        return this.maxPrice;
    }
    getPrice() {
        return this.price;
    }
}

module.exports = ProductPriceModel;
