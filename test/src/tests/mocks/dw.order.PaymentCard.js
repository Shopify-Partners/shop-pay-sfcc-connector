var Status = require('./dw.system.Status')

var PaymentCard = function (cardType) {
    this.cardType = cardType
    this.name = cardType
}

PaymentCard.prototype.getName = function () {}
PaymentCard.prototype.getDescription = function () {}
PaymentCard.prototype.isActive = function () {}
PaymentCard.prototype.getImage = function () {}
PaymentCard.prototype.getCardType = function () {}
PaymentCard.prototype.isApplicable = function () {}
PaymentCard.prototype.verify = function () { return new Status(Status.OK) };
PaymentCard.prototype.name = null
PaymentCard.prototype.description = null
PaymentCard.prototype.image = null
PaymentCard.prototype.cardType = null

module.exports = PaymentCard
