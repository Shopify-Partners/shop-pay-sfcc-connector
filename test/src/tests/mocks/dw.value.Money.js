class Money {
    constructor(value, currencyCode) {
        this.value = value;
        this.currencyCode = currencyCode || 'USD';
        this.available = true;
        this.valueOrNull = value;
        this.getValue = this.getValue();
    }

    add(value) {
        return new Money(this.value + valueOf(value), 'USD');
    }

    subtract() {
        return this.value - 1;
    }

    getAmount() {
        return this;
    }
    toFormattedString() {
        return '$' + this.value;
    }

    valueOf(value) {
        if (typeof (value) === 'object' && value !== null) {
            return value.value;
        }
        return value;
    }

    getValue() {
        return this.value;
    }
}

module.exports = Money;
