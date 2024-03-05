/**
 * Represents dw.system.Status
 */
 var Status = function (item) {
    this.storage = [];
    this.index = this.storage.length;
    if (item !== undefined && item !== Status.ERROR && item !== Status.OK) {
        this.storage[this.index++] = item;
    }
    if (item === Status.ERROR) {
        this.error = true;
        this.status = Status.ERROR;
    } else if (item === Status.OK) {
        this.status = Status.OK;
    }
};

Status.prototype.getIndex = function () { return this.index; };

Status.prototype.code = null; // String
Status.prototype.details = null; // Map
Status.prototype.error = null; // boolean
Status.ERROR = 0; // Number
Status.prototype.items = null; // List
Status.prototype.message = null; // String
Status.OK = 1; // Number
Status.prototype.parameters = null; // List
Status.prototype.status = null; // Number

Status.prototype.addDetail = function (key, value) {}; // void
Status.prototype.addItem = function (item) { this.storage[this.index] = item; this.index++; }; // void
Status.prototype.getCode = function () {}; // String
Status.prototype.getDetail = function (key) {}; // Object
Status.prototype.getDetails = function () {}; // Map
Status.prototype.getItems = function () {}; // List
Status.prototype.getMessage = function () {}; // String
Status.prototype.getParameters = function () {}; // List
Status.prototype.getStatus = function () {}; // Number
Status.prototype.isError = function () {}; // boolean

module.exports = Status;
