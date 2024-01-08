'use strict';
var URLUtils = require('dw/web/URLUtils');
var endpoints = require('*/cartridge/config/oAuthRenentryRedirectEndpoints');

/**
 * Creates an account model for the current customer
 * @param {string} redirectUrl - rurl of the req.querystring
 * @param {string} privacyCache - req.session.privacyCache
 * @param {boolean} newlyRegisteredUser - req.session.privacyCache
 * @returns {string} a redirect url
 */
function getLoginRedirectURL(redirectUrl, privacyCache, newlyRegisteredUser) {
    var endpoint = 'Account-Show';
    var result;
    var targetEndPoint = redirectUrl
        ? parseInt(redirectUrl, 10)
        : 1;

    var registered = newlyRegisteredUser ? 'submitted' : 'false';

    var argsForQueryString = privacyCache.get('args');

    if (targetEndPoint && endpoints[targetEndPoint]) {
        endpoint = endpoints[targetEndPoint];
    }

    if (argsForQueryString) {
        result = URLUtils.url(endpoint, 'registration', registered, 'args', argsForQueryString).relative().toString();
    } else {
        result = URLUtils.url(endpoint, 'registration', registered).relative().toString();
    }

    return result;
}

/**
 * Send an email that would notify the user that account was created
 * @param {obj} registeredUser - object that contains user's email address and name information.
 */
function sendCreateAccountEmail(registeredUser) {
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
    var Site = require('dw/system/Site');
    var Resource = require('dw/web/Resource');

    var userObject = {
        email: registeredUser.email,
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName,
        url: URLUtils.https('Login-Show')
    };

    var emailObj = {
        to: registeredUser.email,
        subject: Resource.msg('email.subject.new.registration', 'registration', null),
        from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@testorganization.com',
        type: emailHelpers.emailTypes.registration
    };

    emailHelpers.sendEmail(emailObj, 'checkout/confirmation/accountRegisteredEmail', userObject);
}

/**
 * Gets the password reset token of a customer
 * @param {Object} customer - the customer requesting password reset token
 * @returns {string} password reset token string
 */
function getPasswordResetToken(customer) {
    var Transaction = require('dw/system/Transaction');

    var passwordResetToken;
    Transaction.wrap(function () {
        passwordResetToken = customer.profile.credentials.createResetPasswordToken();
    });
    return passwordResetToken;
}

/**
 * Sends the email with password reset instructions
 * @param {string} email - email for password reset
 * @param {Object} resettingCustomer - the customer requesting password reset
 */
function sendPasswordResetEmail(email, resettingCustomer) {
    var Resource = require('dw/web/Resource');
    var Site = require('dw/system/Site');
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');

    var passwordResetToken = getPasswordResetToken(resettingCustomer);
    var url = URLUtils.https('Account-SetNewPassword', 'Token', passwordResetToken);
    var objectForEmail = {
        passwordResetToken: passwordResetToken,
        firstName: resettingCustomer.profile.firstName,
        lastName: resettingCustomer.profile.lastName,
        url: url
    };

    var emailObj = {
        to: email,
        subject: Resource.msg('subject.profile.resetpassword.email', 'login', null),
        from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@testorganization.com',
        type: emailHelpers.emailTypes.passwordChanged
    };

    emailHelpers.sendEmail(emailObj, 'account/password/passwordResetEmail', objectForEmail);
}

/**
 * Send an email that would notify the user that account was edited
 * @param {obj} profile - object that contains user's profile information.
 */
function sendAccountEditedEmail(profile) {
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
    var Site = require('dw/system/Site');
    var Resource = require('dw/web/Resource');

    var userObject = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        url: URLUtils.https('Login-Show')
    };

    var emailObj = {
        to: profile.email,
        subject: Resource.msg('email.subject.account.edited', 'account', null),
        from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@testorganization.com',
        type: emailHelpers.emailTypes.accountEdited
    };

    emailHelpers.sendEmail(emailObj, 'account/components/accountEditedEmail', userObject);
}

/**
 *
 * @param {string} email - customer email address
 * @param {string} password - customer password
 * @param {boolean} rememberMe - remember me setting
 * @returns {Object} customerLoginResult
 */
function loginCustomer(email, password, rememberMe) {
    var Transaction = require('dw/system/Transaction');
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Resource = require('dw/web/Resource');
    return Transaction.wrap(function () {
        var authenticateCustomerResult = CustomerMgr.authenticateCustomer(email, password);

        if (authenticateCustomerResult.status !== 'AUTH_OK') {
            var errorCodes = {
                ERROR_CUSTOMER_DISABLED: 'error.message.account.disabled',
                ERROR_CUSTOMER_LOCKED: 'error.message.account.locked',
                ERROR_CUSTOMER_NOT_FOUND: 'error.message.login.form',
                ERROR_PASSWORD_EXPIRED: 'error.message.password.expired',
                ERROR_PASSWORD_MISMATCH: 'error.message.password.mismatch',
                ERROR_UNKNOWN: 'error.message.error.unknown',
                default: 'error.message.login.form'
            };

            var errorMessageKey = errorCodes[authenticateCustomerResult.status] || errorCodes.default;
            var errorMessage = Resource.msg(errorMessageKey, 'login', null);

            return {
                error: true,
                errorMessage: errorMessage,
                status: authenticateCustomerResult.status,
                authenticatedCustomer: null
            };
        }

        return {
            error: false,
            errorMessage: null,
            status: authenticateCustomerResult.status,
            authenticatedCustomer: CustomerMgr.loginCustomer(authenticateCustomerResult, rememberMe)
        };
    });
}

module.exports = {
    getLoginRedirectURL: getLoginRedirectURL,
    sendCreateAccountEmail: sendCreateAccountEmail,
    sendPasswordResetEmail: sendPasswordResetEmail,
    sendAccountEditedEmail: sendAccountEditedEmail,
    loginCustomer: loginCustomer
};
