const ArrayList = require('../dw.util.Collection');

/**
 * Map method for dw.util.Collection subclass instance
 * @param {dw.util.Collection} collection - Collection subclass instance to map over
 * @param {Function} callback - Callback function for each item
 * @param {Object} [scope] - Optional execution scope to pass to callback
 * @returns {Array} Array of results of map
 */
function map(collection, callback, scope) {
    let item = null;
    let index = 0;
    const iterator = collection.iterator();
    const result = [];
    while (iterator.hasNext()) {
        item = iterator.next();
        result.push(scope ? callback.call(scope, item, index, collection)
            : callback(item, index, collection));
        index++;
    }
    return result;
}

/**
 * forEach method for dw.util.Collection subclass instances
 * @param {dw.util.Collection} collection - Collection subclass instance to map over
 * @param {Function} callback - Callback function for each item
 * @param {Object} [scope] - Optional execution scope to pass to callback
 * @returns {void}
 */
function forEach(collection, callback, scope) {
    let item = null;
    let index = 0;
    const iterator = collection.iterator();
    while (iterator.hasNext()) {
        item = iterator.next();
        if (scope) {
            callback.call(scope, item, index, collection);
        } else {
            callback(item, index, collection);
        }
        index++;
    }
}

/**
 * concat method for dw.util.Collection subclass instances
 * @param  {...dw.util.Collection} arguments - first collection to concatinate
 * @return {dw.util.ArrayList} ArrayList containing all passed collections
 */
function concat() {
    const result = new ArrayList();
    for (let i = 0, l = arguments.length; i < l; i++) {
        result.addAll(arguments[i]);
    }
    return result;
}

/**
 * reduce method for dw.util.Collection subclass instances
 * @param {dw.util.Collection} collection - Collection subclass instance to reduce
 * @param {Function} callback - Function to execute on each value in the array
 * @return {Object} result of the execution of callback function on all items
 */
function reduce(collection, callback) {
    if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
    }

    let value;
    let index = 1;
    const iterator = collection.iterator();

    if (arguments.length === 3) {
        value = arguments[2];
        index = 0;
    } else if (iterator.hasNext() && (collection.getLength() !== 1)) {
        value = iterator.next();
    }

    if (collection.getLength() === 0 && !value) {
        throw new TypeError('Reduce of empty array with no initial value');
    }

    if ((collection.getLength() === 1 && !value) || (collection.getLength() === 0 && value)) {
        return collection.getLength() === 1 ? iterator.next() : value;
    }

    while (iterator.hasNext()) {
        const item = iterator.next();
        value = callback(value, item, index, collection);
        index++;
    }

    return value;
}

/**
 * Pluck method for dw.util.Collection subclass instance
 * @param {dw.util.Collection|dw.util.Iterator} list - Collection subclass or Iterator instance to
 *     pluck from
 * @param {string} property - Object property to pluck
 * @returns {Array} Array of results of plucked properties
 */
function pluck(list, property) {
    const result = [];
    const iterator = Object.hasOwnProperty.call(list, 'iterator') ? list.iterator() : list;
    while (iterator.hasNext()) {
        const temp = iterator.next();
        if (temp[property]) {
            result.push(temp[property]);
        }
    }
    return result;
}

/**
 * Find method for dw.util.Collection subclass instance
 * @param {dw.util.Collection} collection - Collection subclass instance to find value in
 * @param {Function} match - Match function
 * @param {Object} [scope] - Optional execution scope to pass to the match function
 * @returns {Object|null} Single item from the collection
 */
function find(collection, match, scope) {
    let result = null;

    if (collection) {
        const iterator = collection.iterator();
        while (iterator.hasNext()) {
            const item = iterator.next();
            if (scope ? match.call(scope, item) : match(item)) {
                result = item;
                break;
            }
        }
    }

    return result;
}

/**
 * Gets the first item from dw.util.Collection subclass instance
 * @param {dw.util.Colleciton} collection - Collection subclass instance to work with
 * @return {Object|null} First element from the collection
 */
function first(collection) {
    const iterator = collection.iterator();
    return iterator.hasNext() ? iterator.next() : null;
}

/**
 * Determines whether every list item meets callback's truthy conditional
 *
 * @param {dw.util.Collection} collection - Collection subclass instance to map over
 * @param {Function} callback - Callback function for each item
 * @return {boolean} - Whether every list item meets callback's truthy conditional
 */
function every(collection, callback) {
    if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
    }

    const iterator = collection.iterator();
    while (iterator.hasNext()) {
        const item = iterator.next();

        if (!callback(item)) {
            return false;
        }
    }
    return true;
}

module.exports = {
    map: map,
    forEach: forEach,
    concat: concat,
    reduce: reduce,
    pluck: pluck,
    find: find,
    first: first,
    every: every
};
