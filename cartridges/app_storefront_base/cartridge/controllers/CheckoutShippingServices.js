'use strict';

/**
 * @namespace CheckoutShippingServices
 */

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

/**
 * CheckoutShippingServices-ToggleMultiShip : The CheckoutShippingServices-ToggleMultiShip endpoint handles splitting the basket in to multiple shipments or condenses everything down into one shipment depending on the usingMultiShip flag
 * @name Base/CheckoutShippingServices-ToggleMultiShip
 * @function
 * @memberof CheckoutShippingServices
 * @param {middleware} - server.middleware.https
 * @param {httpparameter} - usingMultiShip - A boolean that determins wheter or not the shopper wants to use multishipping in the chekcout process
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post('ToggleMultiShip', server.middleware.https, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var Transaction = require('dw/system/Transaction');
    var AccountModel = require('*/cartridge/models/account');
    var OrderModel = require('*/cartridge/models/order');
    var URLUtils = require('dw/web/URLUtils');
    var collections = require('*/cartridge/scripts/util/collections');
    var Locale = require('dw/util/Locale');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var shippingHelpers = require('*/cartridge/scripts/checkout/shippingHelpers');

    var currentBasket = BasketMgr.getCurrentBasket();
    if (!currentBasket) {
        res.json({
            error: true,
            cartError: true,
            fieldErrors: [],
            serverErrors: [],
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });
        return;
    }

    var shipments = currentBasket.shipments;
    var defaultShipment = currentBasket.defaultShipment;
    var usingMultiShipping = req.form.usingMultiShip === 'true';

    req.session.privacyCache.set('usingMultiShipping', usingMultiShipping);


    if (usingMultiShipping) {
        var UUIDUtils = require('dw/util/UUIDUtils');
        // split line items into separate shipments
        Transaction.wrap(function () {
            collections.forEach(shipments, function (shipment) {
                if (shipment.productLineItems.length > 1) {
                    collections.forEach(shipment.productLineItems, function (lineItem) {
                        var uuid = UUIDUtils.createUUID();
                        var newShipment = currentBasket.createShipment(uuid);
                        // only true if customer is registered
                        if (req.currentCustomer.addressBook && req.currentCustomer.addressBook.preferredAddress) {
                            var preferredAddress = req.currentCustomer.addressBook.preferredAddress;
                            COHelpers.copyCustomerAddressToShipment(preferredAddress, newShipment);
                        }

                        shippingHelpers.selectShippingMethod(newShipment);
                        lineItem.setShipment(newShipment);
                    });
                }
            });

            shippingHelpers.selectShippingMethod(defaultShipment);
            defaultShipment.createShippingAddress();

            COHelpers.ensureNoEmptyShipments(req);

            basketCalculationHelpers.calculateTotals(currentBasket);
        });
    } else {
        // combine multiple shipments into a single one
        Transaction.wrap(function () {
            collections.forEach(shipments, function (shipment) {
                if (!shipment.default) {
                    collections.forEach(shipment.productLineItems, function (lineItem) {
                        lineItem.setShipment(defaultShipment);
                    });
                    currentBasket.removeShipment(shipment);
                }
            });

            shippingHelpers.selectShippingMethod(defaultShipment);
            defaultShipment.createShippingAddress();

            COHelpers.ensureNoEmptyShipments(req);

            if (req.currentCustomer.addressBook && req.currentCustomer.addressBook.preferredAddress) {
                var preferredAddress = req.currentCustomer.addressBook.preferredAddress;
                COHelpers.copyCustomerAddressToShipment(preferredAddress);
            }

            basketCalculationHelpers.calculateTotals(currentBasket);
        });
    }

    var currentLocale = Locale.getLocale(req.locale.id);

    var basketModel = new OrderModel(
        currentBasket,
        { usingMultiShipping: usingMultiShipping, countryCode: currentLocale.country, containerView: 'basket' }
    );

    res.json({
        customer: new AccountModel(req.currentCustomer),
        order: basketModel
    });

    next();
});

/**
 * CheckoutShippingServices-SelectShippingMethod : The CheckoutShippingServices-SelectShippingMethod endpoint saves the selected shipping method to the basket
 * @name Base/CheckoutShippingServices-SelectShippingMethod
 * @function
 * @memberof CheckoutShippingServices
 * @param {middleware} - server.middleware.https
 * @param {querystringparameter} - shipmentUUID - the universally unique identifier of the shipment
 * @param {querystringparameter} - methodID - the selected shipping method id
 * @param {httpparameter} - firstName - shipping address input field, shopper's shipping first name
 * @param {httpparameter} - lastName - shipping address input field, shopper's last name
 * @param {httpparameter} - address1 - shipping address input field, address line 1
 * @param {httpparameter} - address2 - shipping address input field address line 2
 * @param {httpparameter} - city - shipping address input field, city
 * @param {httpparameter} - postalCode -  shipping address input field, postal code (or zipcode)
 * @param {httpparameter} - stateCode - shipping address input field, state code (Not all locales have state code)
 * @param {httpparameter} - countryCode -  shipping address input field, country
 * @param {httpparameter} - phone - shipping address input field, shopper's phone number
 * @param {httpparameter} - shipmentUUID - the universally unique identifier of the shipment
 * @param {httpparameter} - methodID - The selected shipping method id
 * @param {httpparameter} - isGift - Checkbox that is for determining whether or not this is a gift
 * @param {httpparameter} - giftMessage - text area for gift message
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post('SelectShippingMethod', server.middleware.https, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var Resource = require('dw/web/Resource');
    var Transaction = require('dw/system/Transaction');
    var AccountModel = require('*/cartridge/models/account');
    var OrderModel = require('*/cartridge/models/order');
    var URLUtils = require('dw/web/URLUtils');
    var ShippingHelper = require('*/cartridge/scripts/checkout/shippingHelpers');
    var Locale = require('dw/util/Locale');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

    var currentBasket = BasketMgr.getCurrentBasket();

    if (!currentBasket) {
        res.json({
            error: true,
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });
        return next();
    }

    var shipmentUUID = req.querystring.shipmentUUID || req.form.shipmentUUID;
    var shippingMethodID = req.querystring.methodID || req.form.methodID;
    var shipment;
    if (shipmentUUID) {
        shipment = ShippingHelper.getShipmentByUUID(currentBasket, shipmentUUID);
    } else {
        shipment = currentBasket.defaultShipment;
    }

    var viewData = res.getViewData();
    viewData.address = ShippingHelper.getAddressFromRequest(req);
    viewData.isGift = req.form.isGift === 'true';
    viewData.giftMessage = req.form.isGift ? req.form.giftMessage : null;
    res.setViewData(viewData);

    this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
        var shippingData = res.getViewData();
        var address = shippingData.address;

        try {
            Transaction.wrap(function () {
                var shippingAddress = shipment.shippingAddress;

                if (!shippingAddress) {
                    shippingAddress = shipment.createShippingAddress();
                }

                shippingAddress.setFirstName(address.firstName || '');
                shippingAddress.setLastName(address.lastName || '');
                shippingAddress.setAddress1(address.address1 || '');
                shippingAddress.setAddress2(address.address2 || '');
                shippingAddress.setCity(address.city || '');
                shippingAddress.setPostalCode(address.postalCode || '');
                shippingAddress.setStateCode(address.stateCode || '');
                shippingAddress.setCountryCode(address.countryCode || '');
                shippingAddress.setPhone(address.phone || '');

                ShippingHelper.selectShippingMethod(shipment, shippingMethodID);

                basketCalculationHelpers.calculateTotals(currentBasket);
            });
        } catch (err) {
            res.setStatusCode(500);
            res.json({
                error: true,
                errorMessage: Resource.msg('error.cannot.select.shipping.method', 'cart', null)
            });

            return;
        }

        COHelpers.setGift(shipment, shippingData.isGift, shippingData.giftMessage);

        var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
        var currentLocale = Locale.getLocale(req.locale.id);

        var basketModel = new OrderModel(
            currentBasket,
            { usingMultiShipping: usingMultiShipping, countryCode: currentLocale.country, containerView: 'basket' }
        );

        res.json({
            customer: new AccountModel(req.currentCustomer),
            order: basketModel
        });
    });

    return next();
});

/**
 * CheckoutShippingServices-UpdateShippingMethodsList : The CheckoutShippingServices-UpdateShippingMethodsList endpoint gets hit once a shopper has entered certain address infromation and gets the applicable shipping methods based on the shopper's supplied shipping address infromation
 * @name Base/CheckoutShippingServices-UpdateShippingMethodsList
 * @function
 * @memberof CheckoutShippingServices
 * @param {middleware} - server.middleware.https
 * @param {querystringparameter} - shipmentUUID - the universally unique identifier of the shipment
 * @param {httpparameter} - firstName - shipping address input field, shopper's shipping first name
 * @param {httpparameter} - lastName - shipping address input field, shopper's last name
 * @param {httpparameter} - address1 - shipping address input field, address line 1
 * @param {httpparameter} - address2 - shipping address nput field address line 2
 * @param {httpparameter} - city - shipping address input field, city
 * @param {httpparameter} - postalCode -  shipping address input field, postal code (or zipcode)
 * @param {httpparameter} - stateCode - shipping address input field, state code (Not all locales have state code)
 * @param {httpparameter} - countryCode -  shipping address input field, country
 * @param {httpparameter} - phone - shipping address input field, shopper's phone number
 * @param {httpparameter} - shipmentUUID - The universally unique identifier of the shipment
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post('UpdateShippingMethodsList', server.middleware.https, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var Transaction = require('dw/system/Transaction');
    var AccountModel = require('*/cartridge/models/account');
    var OrderModel = require('*/cartridge/models/order');
    var URLUtils = require('dw/web/URLUtils');
    var ShippingHelper = require('*/cartridge/scripts/checkout/shippingHelpers');
    var Locale = require('dw/util/Locale');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');

    var currentBasket = BasketMgr.getCurrentBasket();

    if (!currentBasket) {
        res.json({
            error: true,
            cartError: true,
            fieldErrors: [],
            serverErrors: [],
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });
        return next();
    }

    var shipmentUUID = req.querystring.shipmentUUID || req.form.shipmentUUID;
    var shipment;
    if (shipmentUUID) {
        shipment = ShippingHelper.getShipmentByUUID(currentBasket, shipmentUUID);
    } else {
        shipment = currentBasket.defaultShipment;
    }

    var address = ShippingHelper.getAddressFromRequest(req);

    var shippingMethodID;

    if (shipment.shippingMethod) {
        shippingMethodID = shipment.shippingMethod.ID;
    }

    Transaction.wrap(function () {
        var shippingAddress = shipment.shippingAddress;

        if (!shippingAddress) {
            shippingAddress = shipment.createShippingAddress();
        }

        Object.keys(address).forEach(function (key) {
            var value = address[key];
            if (value) {
                shippingAddress[key] = value;
            } else {
                shippingAddress[key] = null;
            }
        });

        ShippingHelper.selectShippingMethod(shipment, shippingMethodID);

        basketCalculationHelpers.calculateTotals(currentBasket);
    });

    var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
    var currentLocale = Locale.getLocale(req.locale.id);

    var basketModel = new OrderModel(
        currentBasket,
        { usingMultiShipping: usingMultiShipping, countryCode: currentLocale.country, containerView: 'basket' }
    );

    res.json({
        customer: new AccountModel(req.currentCustomer),
        order: basketModel,
        shippingForm: server.forms.getForm('shipping')
    });

    return next();
});


/**
 * Handle Ajax shipping form submit
 */
/**
 * CheckoutShippingServices-SubmitShipping : The CheckoutShippingServices-SubmitShipping endpoint submits the shopper's shipping addresse(s) and shipping method(s) and saves them to the basket
 * @name Base/CheckoutShippingServices-SubmitShipping
 * @function
 * @memberof CheckoutShippingServices
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {httpparameter} - shipmentUUID - The universally unique identifier of the shipment
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_shippingMethodID - The selected shipping method id
 * @param {httpparameter} - shipmentSelector - For Guest shopper: A shipment UUID that contains address that matches the selected address, For returning shopper: ab_<address-name-from-address-book>" of the selected address. For both type of shoppers: "new" if a brand new address is entered
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_addressFields_firstName - shipping address input field, shopper's shipping first name
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_addressFields_lastName - shipping address input field, shopper's last name
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_addressFields_address1 - shipping address input field, address line 1
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_addressFields_address2 - shipping address nput field address line 2
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_addressFields_country - shipping address input field, country
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_addressFields_states_stateCode - shipping address input field, state code (Not all locales have state code)
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_addressFields_city - shipping address input field, city
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_addressFields_postalCode - shipping address input field, postal code (or zipcode)
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_addressFields_phone - shipping address input field, shopper's phone number
 * @param {httpparameter} - dwfrm_shipping_shippingAddress_giftMessage - text area for gift message
 * @param {httpparameter} - csrf_token - Hidden input field CSRF token
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post(
    'SubmitShipping',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var BasketMgr = require('dw/order/BasketMgr');
        var URLUtils = require('dw/web/URLUtils');
        var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
        var validationHelpers = require('*/cartridge/scripts/helpers/basketValidationHelpers');

        var currentBasket = BasketMgr.getCurrentBasket();
        if (!currentBasket) {
            res.json({
                error: true,
                cartError: true,
                fieldErrors: [],
                serverErrors: [],
                redirectUrl: URLUtils.url('Cart-Show').toString()
            });
            return next();
        }

        var validatedProducts = validationHelpers.validateProducts(currentBasket);
        if (validatedProducts.error) {
            res.json({
                error: true,
                cartError: true,
                fieldErrors: [],
                serverErrors: [],
                redirectUrl: URLUtils.url('Cart-Show').toString()
            });
            return next();
        }

        var form = server.forms.getForm('shipping');
        var result = {};

        // verify shipping form data
        var shippingFormErrors = COHelpers.validateShippingForm(form.shippingAddress.addressFields);

        if (Object.keys(shippingFormErrors).length > 0) {
            req.session.privacyCache.set(currentBasket.defaultShipment.UUID, 'invalid');

            res.json({
                form: form,
                fieldErrors: [shippingFormErrors],
                serverErrors: [],
                error: true
            });
        } else {
            req.session.privacyCache.set(currentBasket.defaultShipment.UUID, 'valid');

            result.address = {
                firstName: form.shippingAddress.addressFields.firstName.value,
                lastName: form.shippingAddress.addressFields.lastName.value,
                address1: form.shippingAddress.addressFields.address1.value,
                address2: form.shippingAddress.addressFields.address2.value,
                city: form.shippingAddress.addressFields.city.value,
                postalCode: form.shippingAddress.addressFields.postalCode.value,
                countryCode: form.shippingAddress.addressFields.country.value,
                phone: form.shippingAddress.addressFields.phone.value
            };
            if (Object.prototype.hasOwnProperty
                .call(form.shippingAddress.addressFields, 'states')) {
                result.address.stateCode =
                    form.shippingAddress.addressFields.states.stateCode.value;
            }

            result.shippingBillingSame =
                form.shippingAddress.shippingAddressUseAsBillingAddress.value;

            result.shippingMethod = form.shippingAddress.shippingMethodID.value
                ? form.shippingAddress.shippingMethodID.value.toString()
                : null;

            result.isGift = form.shippingAddress.isGift.checked;

            result.giftMessage = result.isGift ? form.shippingAddress.giftMessage.value : null;

            res.setViewData(result);

            this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
                var AccountModel = require('*/cartridge/models/account');
                var OrderModel = require('*/cartridge/models/order');
                var Locale = require('dw/util/Locale');

                var shippingData = res.getViewData();

                COHelpers.copyShippingAddressToShipment(
                    shippingData,
                    currentBasket.defaultShipment
                );

                var giftResult = COHelpers.setGift(
                    currentBasket.defaultShipment,
                    shippingData.isGift,
                    shippingData.giftMessage
                );

                if (giftResult.error) {
                    res.json({
                        error: giftResult.error,
                        fieldErrors: [],
                        serverErrors: [giftResult.errorMessage]
                    });
                    return;
                }

                if (!currentBasket.billingAddress) {
                    if (req.currentCustomer.addressBook
                        && req.currentCustomer.addressBook.preferredAddress) {
                        // Copy over preferredAddress (use addressUUID for matching)
                        COHelpers.copyBillingAddressToBasket(
                            req.currentCustomer.addressBook.preferredAddress, currentBasket);
                    } else {
                        // Copy over first shipping address (use shipmentUUID for matching)
                        COHelpers.copyBillingAddressToBasket(
                            currentBasket.defaultShipment.shippingAddress, currentBasket);
                    }
                }
                var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
                if (usingMultiShipping === true && currentBasket.shipments.length < 2) {
                    req.session.privacyCache.set('usingMultiShipping', false);
                    usingMultiShipping = false;
                }

                COHelpers.recalculateBasket(currentBasket);

                var currentLocale = Locale.getLocale(req.locale.id);
                var basketModel = new OrderModel(
                    currentBasket,
                    {
                        usingMultiShipping: usingMultiShipping,
                        shippable: true,
                        countryCode: currentLocale.country,
                        containerView: 'basket'
                    }
                );

                res.json({
                    customer: new AccountModel(req.currentCustomer),
                    order: basketModel,
                    form: server.forms.getForm('shipping')
                });
            });
        }

        return next();
    }
);


module.exports = server.exports();
