class Quantity {
    constructor(value = 0, unit = 'USD') {
        this.value = value;
        this.unit = unit;
    }
    getValue() {
        return this.value;
    }
}

module.exports = Quantity;
