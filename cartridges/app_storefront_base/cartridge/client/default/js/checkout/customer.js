'use strict';

var formHelpers = require('./formErrors');
var scrollAnimate = require('../components/scrollAnimate');
var createErrorNotification = require('../components/errorNotification');
var GUEST_FORM = '#guest-customer';
var REGISTERED_FORM = '#registered-customer';
var ERROR_SECTION = '.customer-error';

/**
 * @returns {boolean} If guest is active, registered is not visible
 */
function isGuestFormActive() {
    return $(REGISTERED_FORM).hasClass('d-none');
}

/**
 * Clear any previous errors in the customer form.
 */
function clearErrors() {
    $(ERROR_SECTION).children().remove();
    formHelpers.clearPreviousErrors('.customer-information-block');
}

/**
 * @param {Object} customerData - data includes checkout related customer information
 * @param {Object} orderData - data includes checkout related order information
 */
function updateCustomerInformation(customerData, orderData) {
    var $container = $('.customer-summary');
    var $summaryDetails = $container.find('.summary-details');
    var email = customerData.profile && customerData.profile.email ? customerData.profile.email : orderData.orderEmail;
    $summaryDetails.find('.customer-summary-email').text(email);
    if (customerData.registeredUser) {
        $container.find('.edit-button').hide();
    } else {
        $container.find('.edit-button').show();
    }
}


/**
 * Handle response from the server for valid or invalid form fields.
 * @param {Object} defer - the deferred object which will resolve on success or reject.
 * @param {Object} data - the response data with the invalid form fields or
 *  valid model data.
 */
function customerFormResponse(defer, data) {
    var parentForm = isGuestFormActive() ? GUEST_FORM : REGISTERED_FORM;
    var formSelector = '.customer-section ' + parentForm;

    // highlight fields with errors
    if (data.error) {
        if (data.fieldErrors.length) {
            data.fieldErrors.forEach(function (error) {
                if (Object.keys(error).length) {
                    formHelpers.loadFormErrors(formSelector, error);
                }
            });
        }

        if (data.customerErrorMessage) {
            createErrorNotification(ERROR_SECTION, data.customerErrorMessage);
        }

        if (data.fieldErrors.length || data.customerErrorMessage || (data.serverErrors && data.serverErrors.length)) {
            defer.reject(data);
        }

        if (data.cartError) {
            window.location.href = data.redirectUrl;
            defer.reject();
        }
    } else {
        // Populate the Address Summary

        $('body').trigger('checkout:updateCheckoutView', {
            order: data.order,
            customer: data.customer,
            csrfToken: data.csrfToken
        });
        scrollAnimate($('.shipping-form'));
        defer.resolve(data);
    }
}

/**
 *
 * @param {boolean} registered - wether a registered login block will be used
 */
function chooseLoginBlock(registered) {
    $(ERROR_SECTION).find('.alert').remove();
    $('#password').val('');
    if (registered) {
        $(REGISTERED_FORM).removeClass('d-none');
        $(GUEST_FORM).addClass('d-none');
        $('#email').val($('#email-guest').val());
    } else {
        $(REGISTERED_FORM).addClass('d-none');
        $(GUEST_FORM).removeClass('d-none');
        $('#email').val('');
    }
}

module.exports = {

    /**
     * Listeners for customer form
     */
    initListeners: function () {
        // 1. password
        var customerLogin = '.js-login-customer';
        var cancelLogin = '.js-cancel-login';
        var registered;
        if (customerLogin.length !== 0) {
            $('body').on('click', customerLogin, function (e) {
                registered = true;
                e.preventDefault();
                chooseLoginBlock(registered);
            });
        }
        if (cancelLogin.length !== 0) {
            $('body').on('click', cancelLogin, function (e) {
                registered = false;
                e.preventDefault();
                chooseLoginBlock(registered);
            });
        }
    },

    methods: {
        clearErrors: clearErrors,
        updateCustomerInformation: updateCustomerInformation,
        customerFormResponse: customerFormResponse,
        isGuestFormActive: isGuestFormActive
    },

    vars: {
        GUEST_FORM: GUEST_FORM,
        REGISTERED_FORM: REGISTERED_FORM
    }

};
