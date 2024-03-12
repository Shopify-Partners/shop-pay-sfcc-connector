const Collection = require('./Collection');

class ArrayList {
    constructor() {
        this.items = [];
        this.length = 0;
    }

    contains(data) {
        return this.items.includes(data);
    }

    addAt(index, data) {
        this.items[index] = data;
    }

    push(item) {
        this.length = this.length + 1;
        this.items.push(item);
    }

    clear() {
        this.length = 0;
        this.items = [];
    }
}

function toArrayList(params) {
    return new Collection(params);
}

module.exports = {
    ArrayList: ArrayList,
    toArrayList: toArrayList
};
