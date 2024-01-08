'use strict';

/**
 * @namespace Login
 */

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

/**
 * Login-Show : This endpoint is called to load the login page
 * @name Base/Login-Show
 * @function
 * @memberof Login
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.generateToken
 * @param {querystringparameter} - rurl - Redirect URL
 * @param {querystringparameter} - action - Action on submit of Login Form
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get(
    'Show',
    consentTracking.consent,
    server.middleware.https,
    csrfProtection.generateToken,
    function (req, res, next) {
        var URLUtils = require('dw/web/URLUtils');
        var Resource = require('dw/web/Resource');

        var target = req.querystring.rurl || 1;

        var rememberMe = false;
        var userName = '';
        var actionUrl = URLUtils.url('Account-Login', 'rurl', target);
        var createAccountUrl = URLUtils.url('Account-SubmitRegistration', 'rurl', target).relative().toString();
        var navTabValue = req.querystring.action;

        if (req.currentCustomer.credentials) {
            rememberMe = true;
            userName = req.currentCustomer.credentials.username;
        }

        var breadcrumbs = [
            {
                htmlValue: Resource.msg('global.home', 'common', null),
                url: URLUtils.home().toString()
            }
        ];

        var profileForm = server.forms.getForm('profile');
        profileForm.clear();

        res.render('/account/login', {
            navTabValue: navTabValue || 'login',
            rememberMe: rememberMe,
            userName: userName,
            actionUrl: actionUrl,
            profileForm: profileForm,
            breadcrumbs: breadcrumbs,
            oAuthReentryEndpoint: 1,
            createAccountUrl: createAccountUrl
        });

        next();
    }
);

/**
 * Login-Logout : This endpoint is called to log shopper out of the session
 * @name Base/Login-Logout
 * @function
 * @memberof Login
 * @param {category} - sensitive
 * @param {serverfunction} - get
 */
server.get('Logout', function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var CustomerMgr = require('dw/customer/CustomerMgr');

    CustomerMgr.logoutCustomer(false);
    res.redirect(URLUtils.url('Home-Show'));
    next();
});

/**
 * Login-OAuthLogin : This endpoint invokes the External OAuth Providers Login
 * @name Base/Login-OAuthLogin
 * @function
 * @memberof Login
 * @param {middleware} - server.middleware.https
 * @param {middleware} - consentTracking.consent
 * @param {querystringparameter} - oauthProvider - ID of the OAuth Provider. e.g. Facebook, Google
 * @param {querystringparameter} - oauthLoginTargetEndPoint - Valid values for this parameter are 1 or 2. These values are mapped in oAuthRenentryRedirectEndpoints.js
 * @param {category} - sensitive
 * @param {renders} - isml if there is an error
 * @param {serverfunction} - get
 */
server.get('OAuthLogin', server.middleware.https, consentTracking.consent, function (req, res, next) {
    var oauthLoginFlowMgr = require('dw/customer/oauth/OAuthLoginFlowMgr');
    var Resource = require('dw/web/Resource');
    var endpoints = require('*/cartridge/config/oAuthRenentryRedirectEndpoints');

    var targetEndPoint = req.querystring.oauthLoginTargetEndPoint
        ? parseInt(req.querystring.oauthLoginTargetEndPoint, 10)
        : null;

    if (targetEndPoint && endpoints[targetEndPoint]) {
        req.session.privacyCache.set(
            'oauthLoginTargetEndPoint',
            endpoints[targetEndPoint]
        );
    } else {
        res.render('/error', {
            message: Resource.msg('error.oauth.login.failure', 'login', null)
        });

        return next();
    }

    if (req.querystring.oauthProvider) {
        var oauthProvider = req.querystring.oauthProvider;
        var result = oauthLoginFlowMgr.initiateOAuthLogin(oauthProvider);

        if (result) {
            res.redirect(result.location);
        } else {
            res.render('/error', {
                message: Resource.msg('error.oauth.login.failure', 'login', null)
            });

            return next();
        }
    } else {
        res.render('/error', {
            message: Resource.msg('error.oauth.login.failure', 'login', null)
        });

        return next();
    }

    return next();
});

/**
 * Login-OAuthReentry : This endpoint is called by the External OAuth Login Provider (Facebook, Google etc. to re-enter storefront after shopper logs in using their service
 * @name Base/Login-OAuthReentry
 * @function
 * @memberof Login
 * @param {middleware} - server.middleware.https
 * @param {middleware} - consentTracking.consent
 * @param {querystringparameter} - code - given by facebook
 * @param {querystringparameter} - state - given by facebook
 * @param {category} - sensitive
 * @param {renders} - isml only if there is a error
 * @param {serverfunction} - get
 */
server.get('OAuthReentry', server.middleware.https, consentTracking.consent, function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var oauthLoginFlowMgr = require('dw/customer/oauth/OAuthLoginFlowMgr');
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Transaction = require('dw/system/Transaction');
    var Resource = require('dw/web/Resource');

    var destination = req.session.privacyCache.store.oauthLoginTargetEndPoint;

    var finalizeOAuthLoginResult = oauthLoginFlowMgr.finalizeOAuthLogin();
    if (!finalizeOAuthLoginResult) {
        res.redirect(URLUtils.url('Login-Show'));
        return next();
    }

    var response = finalizeOAuthLoginResult.userInfoResponse.userInfo;
    var oauthProviderID = finalizeOAuthLoginResult.accessTokenResponse.oauthProviderId;

    if (!oauthProviderID) {
        res.render('/error', {
            message: Resource.msg('error.oauth.login.failure', 'login', null)
        });

        return next();
    }

    if (!response) {
        res.render('/error', {
            message: Resource.msg('error.oauth.login.failure', 'login', null)
        });

        return next();
    }

    var externalProfile = JSON.parse(response);
    if (!externalProfile) {
        res.render('/error', {
            message: Resource.msg('error.oauth.login.failure', 'login', null)
        });

        return next();
    }

    var userID = externalProfile.id || externalProfile.uid;
    if (!userID) {
        res.render('/error', {
            message: Resource.msg('error.oauth.login.failure', 'login', null)
        });

        return next();
    }

    var authenticatedCustomerProfile = CustomerMgr.getExternallyAuthenticatedCustomerProfile(
        oauthProviderID,
        userID
    );

    if (!authenticatedCustomerProfile) {
        // Create new profile
        Transaction.wrap(function () {
            var newCustomer = CustomerMgr.createExternallyAuthenticatedCustomer(
                oauthProviderID,
                userID
            );

            authenticatedCustomerProfile = newCustomer.getProfile();
            var firstName;
            var lastName;
            var email;

            // Google comes with a 'name' property that holds first and last name.
            if (typeof externalProfile.name === 'object') {
                firstName = externalProfile.name.givenName;
                lastName = externalProfile.name.familyName;
            } else {
                // The other providers use one of these, GitHub has just a 'name'.
                firstName = externalProfile['first-name']
                    || externalProfile.first_name
                    || externalProfile.name;

                lastName = externalProfile['last-name']
                    || externalProfile.last_name
                    || externalProfile.name;
            }

            email = externalProfile['email-address'] || externalProfile.email;

            if (!email) {
                var emails = externalProfile.emails;

                if (emails && emails.length) {
                    email = externalProfile.emails[0].value;
                }
            }

            authenticatedCustomerProfile.setFirstName(firstName);
            authenticatedCustomerProfile.setLastName(lastName);
            authenticatedCustomerProfile.setEmail(email);
        });
    }

    var credentials = authenticatedCustomerProfile.getCredentials();
    if (credentials.isEnabled()) {
        Transaction.wrap(function () {
            CustomerMgr.loginExternallyAuthenticatedCustomer(oauthProviderID, userID, false);
        });
    } else {
        res.render('/error', {
            message: Resource.msg('error.oauth.login.failure', 'login', null)
        });

        return next();
    }

    req.session.privacyCache.clear();
    res.redirect(URLUtils.url(destination));

    return next();
});

module.exports = server.exports();
