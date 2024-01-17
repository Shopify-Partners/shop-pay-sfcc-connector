class ProductVariationModel {
    constructor() {
        this.productMaster = {
            ID: '883814258849'
        };
    }

    getProductVariationAttribute(id) {
        return id;
    }

    getSelectedValue(attribute) {
        return {
            displayValue: attribute
        };
    }

    getMaster() {
        return this.productMaster;
    }
}

module.exports = ProductVariationModel;
