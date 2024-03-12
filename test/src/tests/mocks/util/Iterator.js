 var Iterator = function (iterable) {
    if (Array.isArray(iterable)) {
        this.storage = iterable;
    } else {
        this.storage = [];
    }
    this.index = 0;
};

Iterator.prototype.asList = function () {};
Iterator.prototype.hasNext = function () { return (this.storage.length > 0 && this.index < this.storage.length); };
Iterator.prototype.next = function () { return this.storage[this.index++]; };

module.exports = Iterator;
