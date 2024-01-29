module.exports = function (array) {
    let items = [];
    if (array) {
        items = array;
    }

    this.add = function (item) {
        items.push(item);
    };

    this.iterator = function () {
        let i = 0;
        return {
            hasNext: function () {
                return i < items.length;
            },
            next: function () {
                return items[i++];
            }
        };
    };

    this.getLength = function () {
        return items.length;
    };

    this.length = this.getLength();

    this.toArray = function () {
        return items;
    };

    this.addAll = function (collection) {
        items = items.concat(collection.toArray());
    };

    this.contains = function (item) {
        return array.indexOf(item) >= 0;
    };

    this.map = function () {
        const args = Array.from(arguments);
        const list = args[0];
        const callback = args[1];
        if (list && Object.prototype.hasOwnProperty.call(list, 'toArray')) {
            // eslint-disable-next-line no-const-assign
            list = list.toArray();
        }
        return list ? list.map(callback) : [];
    };

    this.get = function (index) {
        return items[index];
    };

    this.push = function (item) {
        this.length = this.length + 1;
        items.push(item);
    }
};
