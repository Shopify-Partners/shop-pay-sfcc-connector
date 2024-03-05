var Decimal = function (value) {
    this.value = value;
};

Decimal.prototype.multiply = function (quantity) { return new Decimal(this.value * quantity); };
Decimal.prototype.get = function () { return this.value; };

module.exports = Decimal;
