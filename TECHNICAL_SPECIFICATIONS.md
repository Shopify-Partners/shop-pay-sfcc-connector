# SFCC Shop Pay Connector Reference Code Technical Specifications

## Table of Contents

[1. General Architecture](#1-general-architecture)

   * [1.1. Cartridge Structure](#11-cartridge-structure)

      * [1.1.1. Cartridges](#111-cartridges)

      * [1.1.2. Documentation](#112-documentation)

      * [1.1.3. Metadata](#113-metadata)

      * [1.1.4. Test](#114-test)

      * [1.1.5. Config files (loose files, not in a subfolder)](#115-config-files-loose-files-not-in-a-subfolder)

   * [1.2. Checkout Flow](#12-checkout-flow)

   * [1.3. Post-Order Processing](#13-post-order-processing)

      * [1.3.1. SFCC Scope](#131-sfcc-scope)

      * [1.3.2. SFCC Starter Logic](#132-sfcc-starter-logic)

      * [1.3.3. Defer to OMS with Guidance](#133-defer-to-oms-with-guidance)

[2. Client Side and Front End](#2-client-side-and-front-end)

   * [2.1. Script Include](#21-script-include)

      * [2.1.1. Adding Backend Controller URLs to the Browser Window](#211-adding-backend-controller-urls-to-the-browser-window)

      * [2.1.2. Adding CSRF Token to template for AJAX calls](#212-adding-csrf-token-to-template-for-ajax-calls)

   * [2.2. Client Side JS](#22-client-side-js)

      * [2.2.1. General Notes](#221-general-notes)

      * [2.2.2. Documentation](#222-documentation)

      * [2.3. Event Listeners and Handlers](#23-event-listeners-and-handlers)

         * [2.3.1. Creating a session](#231-creating-a-session)

         * [2.3.2. sessionrequested](#232-sessionrequested)

         * [2.3.3. discountcodechanged](#233-discountcodechanged)

         * [2.3.4. shippingaddresschanged](#234-shippingaddresschanged)

         * [2.3.5. deliverymethodchanged](#235-deliverymethodchanged)

         * [2.3.6. paymentconfirmationrequested](#236-paymentconfirmationrequested)

         * [2.3.7. paymentcomplete](#237-paymentcomplete)

         * [2.3.8. Handling Cart Updates](#238-handling-cart-updates)

      * [2.4. Shop Pay Button Styles](#24-shop-pay-button-styles)

      * [2.5. Template Overrides](#25-template-overrides)

[3. Meta Data and Configurations](#3-meta-data-and-configurations)

   * [3.1. General Guidelines](#31-general-guidelines)

   * [3.2. Payment Methods](#32-payment-methods)

   * [3.3. Payment Processors](#33-payment-processors)

   * [3.4. Web Services](#34-web-services)

   * [3.5. Custom Objects](#35-custom-objects)

   * [3.6. Custom Attributes](#36-custom-attributes)

      * [3.6.1. Order](#361-order)

      * [3.6.2. Order Payment Instrument](#362-orderpaymentinstrument)

      * [3.6.3. SitePreferences](#363-sitepreferences)

[4. Server Side and Back End: Scripts and Controllers](#4-server-side-and-back-end-scripts-and-controllers)

   * [4.1. Custom Controllers](#41-custom-controllers)

      * [4.1.1. Shop Pay Get Cart Summary](#411-shoppay-getcartsummary)

      * [4.1.2. Shop Pay Begin Session](#412-shoppay-beginsession)

      * [4.1.3. Shop Pay Discount Code Changed](#413-shoppay-discountcodechanged)

      * [4.1.4. Shop Pay Shipping Address Changed](#414-shoppay-shippingaddresschanged)

      * [4.1.5. Shop Pay Delivery Method Changed](#415-shoppay-deliverymethodchanged)

      * [4.1.6. Shop Pay Submit Payment](#416-shoppay-submitpayment)

   * [4.2. Controller Extensions](#42-controller-extensions)

      * [4.2.1. Cart Show](#421-cart-show)

      * [4.2.2. Product Show](#422-product-show)

      * [4.2.3. Checkout Begin](#423-checkout-begin)

      * [4.2.4. Helper Scripts](#424-helper-scripts)

      * [4.2.5. Shop Pay URLs](#425-shop-pay-urls)

   * [4.3. Web Services](#43-web-services)

   * [4.4. Shopify Storefront API](#44-shopify-storefront-api)

      * [4.4.1. External Documentation](#441-external-documentation)

      * [4.4.2. SFCC Implementation Details](#442-sfcc-implementation-details)

      * [4.4.3. ShopPayPaymentRequestSessionCreate](#443-shoppaypaymentrequestsessioncreate)

      * [4.4.4. ShopPayPaymentRequestSessionSubmit](#444-shoppaypaymentrequestsessionsubmit)

   * [4.5. Shopify Admin API](#45-shopify-admin-api)

      * [4.5.1. External Documentation](#451-external-documentation)

      * [4.5.2. SFCC Implementation Details](#452-sfcc-implementation-details)

      * [4.5.3. Get Order by Source Identifier](#453-get-order-by-source-identifier)

      * [4.5.4. Get Order Transactions](#454-get-order-transactions)

      * [4.5.5. Payment Capture](#455-payment-capture)

      * [4.5.6. Get Order Fulfillment Orders](#456-get-order-fulfillment-orders)

      * [4.5.7. Fulfillment Tracking](#457-fulfillment-tracking)

      * [4.5.8. Refund Creation](#458-refund-creation)

      * [4.5.9. Webhook Subscribe](#459-webhook-subscribe)

* [5. Jobs](#5-jobs)

   * [5.1. Shopify Webhook Subscribe](#51-shopify-webhook-subscribe)

   * [5.2. Order Reconciliation](#52-order-reconciliation)

   * [5.3. Webhooks](#53-webhooks)

      * [5.3.1. ORDERS_CREATE](#531-orders_create)

      * [5.3.2. ORDER_TRANSACTIONS_CREATE](#532-order_transactions_create)

---

## 1. **General Architecture**

### 1.1. **Cartridge Structure**

#### 1.1.1. Cartridges

- int_shoppay
   - Code that can be utilized for SFRA as well as a possible future SiteGenesis build out
      - Web services
      - Helper scripts
      - Templates
      - Client-side JS
- int_shoppay_sfra
   - SFRA custom controllers and controller extensions
- int_shoppay_abtest
   - Controller extensions, template overrides, and helper scripts that are required only for A/B testing of the Shop Pay Component vs control (Merchant-assigned A/B testing)

#### 1.1.2. Documentation

- Integration and extensibility guide

#### 1.1.3. Metadata

- Structure this folder for zip and import via SFCC business manager (Site Import & Export)

#### 1.1.4. Test

- Unit/integration testing scripts

#### 1.1.5. Config files (loose files, not in a subfolder)

- package.json
- README.md
- etc.

### 1.2. **Checkout Flow**

Source: https://shopify.dev/docs/api/commerce-components/pay#sequence-diagram

### 1.3. **Post-Order Processing**

#### 1.3.1. **SFCC Scope**

- ORDERS_CREATE webhook handling and reconciliation job

#### 1.3.2. **SFCC Starter Logic**

- Payment capture
   - Web service call
   - Job framework
   - Leave order/export/payment status handling up to the end user to customize/implement (will need to override at least one helper function in the place order flow)

#### 1.3.3. **Defer to OMS with Guidance**

- Order risks handling
- ORDER_TRANSACTIONS_CREATE webhook handling
- DISPUTES_CREATE, DISPUTES_UPDATE webhook handling
- Fulfillment tracking
- Refund creation

## 2. **Client Side and Front End**

### 2.1. **Script Include**

```javascript
<script src="https://cdn.shopify.com/shopifycloud/shop-js/shop-pay-payment request.js"></script>
```

- Leverage the app.template.htmlHead hook in htmlHead.isml to include the script tag
- Add a pdict var to the Cart-Show, Product-Show, and Checkout-Begin (any others?) controllers to include the script on specific pages ([Sample Code](https://themazegroup.atlassian.net/wiki/spaces/SSPSC/pages/2582609971/Server+Side+Back+End#Cart-Show)).
- Include logic in the hook to render the script tag on ALL site pages during merchant assigned A/B testing (and A/A testing)

Sample (rough) implementation of the htmlHead(pdict) hook function and template:

```javascript
'use strict';
const ISML = require('dw/template/ISML');
/**
* Renders app.template.htmlHead hook content
*/
function htmlHead(pdict) {
  var includeShopPayJS = pdict.includeShopPayJS; // update logic for A/B testing to render script tag on all pages
  if (includeShopPayJS) {
    ISML.renderTemplate('/header/shoppayScriptIncludes');
  }
}
module.exports = {
  htmlHead: htmlHead
};
<iscontent type="text/html" charset="UTF-8" compact="true" />
<script src="https://cdn.shopify.com/shopifycloud/shop-js/shop-pay-payment-request.js"></script>
```

### 2.1.1. **Adding Backend Controller URLs to the Browser Window**

This script will need to be added to any template where Shop Pay client-side scripts will be running so the client side scripts have access to the urls for the controllers that handle Shop Pay events

```javascript
<script>
  window.ShopPayUrls = JSON.parse('<isprint encoding="jsonvalue" value="${pdict.ShopPayUrlsString}" />')
</script>
```

### 2.1.2. **Adding CSRF Token to template for AJAX calls**

Use a data attribute on the Shop Pay button on Cart, PDP, and Checkout pages to include the CSRF token provided by an append to each page controller. This token needs to be appended to the controller URL as an http parameter “?csrf_token=xxx” for security when ajax calls are made from the Shop Pay event handlers. Example shown below.

```javascript
<div id="shop-pay-button-wrapper" data-tokenName="${pdict.csrf.tokenName}" data-token="${pdict.csrf.token}">
  <div id="shop-pay-button-container"></div>
</div>
```

### 2.2. **Client Side JS**

#### 2.2.1. General Notes

All event handler controllers will return information about error status, specifically error: true/false, errorMsg: string/null.

If error = true, send the errors object, instead of the paymentRequestObject, to the event completion handler to abort the Shop Pay payment flow (and render a message in the Shop Pay modal, where applicable). Simple example:

```javascript
session.completeDiscountCodeChange({
  errors: [
    {
      "type": "discountCodeError",
      "message": "Your custom discount error message here."
    }
  ]
});
```

#### 2.2.2. Documentation

https://shopify.dev/docs/api/commerce-components/pay#shoppayusererror

```javascript
interface ShopPayPaymentRequestUpdate {
  updatedPaymentRequest?: ShopPayPaymentRequest;
  errors?: ShopPayUserError[];
  }
errors: [
  {
  "type": "generalError",
  "message": "Your custom error message here."
  }
]
```

### 2.3. **Event Listeners and Handlers**

#### 2.3.1. **Creating a session**

- Gets CSRF token from hidden data attribute on the page
- Calls the ShopPay-GetCartSummary controller via AJAX
   - Sets csrf_token as an http parameter in the ajax request URL
   - Receives JSON response containing the PaymentRequest object
   - Sets shippingAddress to null (in the event a registered customer already has their primary address set on the cart, Shop Pay addresses should take precedence) and set deliveryMethods to [].
- Create session by calling ShopPay.PaymentRequest.createSession from ShopPay SDK passing the paymentRequest object form the AJAX call above

#### 2.3.2. **sessionrequested**

- Gets CSRF token from hidden data attribute on the page
- Calls the ShopPay-BeginSession controller via AJAX
   - Sets csrf_token as an http parameter in the ajax request URL
   - Receives JSON response containing the token, checkoutUrl, and sourceIdentifier - Then after the ASYNC AJAX response is received session.completeSessionRequest is called using the data retuned by Shop-BeginSession

   - this verify’s the session allowing the Shop Pay Popup to start the checkout process

#### 2.3.3. **discountcodechanged**

- Gets CSRF token from hidden data attribute on the page
- Calls the ShopPay-DiscountCodeChanged controller via AJAX
   - Sets csrf_token as an http parameter in the ajax request URL
   - Provides updated discountCodes object so the controller can update the order totals and discounts

   - Receives JSON response containing the updated lineItems array
- Calls window.ShopPay.PaymentRequest.build using spread operator and replacing lineItems with the array provided by the response above to build a new paymentRequest object

- Calls session.completeDiscountCodeChange from ShopPay SDK passing it the updated paymentRequest object

#### 2.3.4. **shippingaddresschanged**

- Gets CSRF token from hidden data attribute on the page
- Calls the ShopPay-ShippingAddressChanged controller via AJAX
   - Sets csrf_token as an http parameter in the ajax request URL
   - Provides updated shippingAddress object so the controller return updated delivery methods

   - Receives JSON response containing the updated deliveryMethods array - Calls window.ShopPay.PaymentRequest.build using spread operator and replacing deliveryMethods with the array provided by the response above to build a new paymentRequest object

- Calls session.completeShippingAddressChange from ShopPay SDK passing it the updated paymentRequest object

#### 2.3.5. **deliverymethodchanged**

- Gets CSRF token from hidden data attribute on the page
- Calls the ShopPay-DeliveryMethodChanged controller via AJAX
   - Sets csrf_token as an http parameter in the ajax request URL
   - Provides updated deliveryMethod object so the controller return updated shippings lines and totals

   - Receives JSON response containing the updated shippingLines array and totals object

- Calls window.ShopPay.PaymentRequest.build using spread operator and replacing deliveryMethods with the array provided by the response above to build a new paymentRequest object

- Calls session.completeDeliveryMethodChange from ShopPay SDK passing it the updated paymentRequest object

#### 2.3.6. **paymentconfirmationrequested**

- If order is valid according to business logic that can be added in this function - Example if total amount is greater than 1000 call

session.completePaymentConfirmationRequest passing errors object to display the error in the ShopPay Popup

- Gets CSRF token from hidden data attribute on the page
- Calls the ShopPay-ShippingSubmitPayment controller via AJAX
   - Sets csrf_token as an http parameter in the ajax request URL
   - Provides session.token and session.paymentRequest
   - Receives JSON response containing any possible errors
      - On success, call session.completePaymentConfirmationRequest from the ShopPay SDK

#### 2.3.7. **paymentcomplete**

- If event processingStatus.status equals “completed” , call session.close and redirect to the order confirmation page.

- Data elements continueUrl, orderID, and orderToken will be returned by the ShopPay SubmitPayment controller.

- Sample redirect implementation (refer to checkout/checkout.js in the OOTB SFRA client-side JS)

```javascript
{
 var redirect = $('<form>')
 .appendTo(document.body)
 .attr({
 method: 'POST',
 action: data.continueUrl
 });
 $('<input>')
 .appendTo(redirect)
 .attr({

 name: 'orderID',
 value: data.orderID
 });
 $('<input>')
 .appendTo(redirect)
 .attr({
 name: 'orderToken',
 value: data.orderToken
 });
 redirect.submit();
}
```

#### 2.3.8. **Handling Cart Updates**

There are multiple events that can occur on the PDP and Cart pages in which the cart contents are updated, but the page is not refreshed (e.g, quantity update, removal in mini-cart, add to cart). In these scenarios, the paymentRequest object in the Shop Pay session (initialized on page load), would be out of date when the Shop Pay button is clicked and the modal is opened. Due to complications in tracking and handling these events within the Shop Pay-specific JS and session, the paymentRequest object should be updated at the time the customer clicks on the Shop Pay button (use a wrapper, if necessary, to listen for this event).

Upon clicking the Shop Pay button in Cart and PDP,

- Call the ShopPay-GetCartSummary controller via AJAX to get the
updatedPaymentRequest object from the SFCC back end
- Set the shippingAddress to null (in the event a registered customer already has their primary address set on the cart, Shop Pay addresses should take precedence) and set deliveryMethods to [] in the payment Request object.

- Push the paymentRequest object to the Shop Pay session:

session.completeDiscountCodeChange({updatedPaymentRequest: updatedPaymentRequest})

### 2.4. **Shop Pay Button Styles**

Shop Pay branding guidance for the Shop Pay buttons: https://shopify.dev/docs/api/commerce components/pay/design-guidelines#specs-and-customization

### 2.5. **Template Overrides**

- The following code needs to be include on the PDP and Checkout templates: https://shopify.dev/docs/api/commerce-components/pay#javascript-sdk-for-buttons-and email-recognition

- Add a data attribute (data-token) to the shop pay button wrapper that can be scraped and appended to the URL in ajax calls to the ShopPay controllers.

## 3. **Meta Data and Configurations**

### 3.1. **General Guidelines**

1. Use the same prefix (shoppay) on all ShopPay-specific custom attributes so they can be clearly linked to this integration.
2. Use camel case for custom attribute IDs

### 3.2. **Payment Methods**

ShopPay

### 3.3. **Payment Processors**

SHOPPAY

### 3.4. **Web Services**

shoppay.api.admin

Endpoint: https://{store_id}.myshopify.com/admin/api/{admin_api_version}/graphql.json

Username: (leave blank/omit)

Password: (leave blank/omit)

The store_id and admin_api_version will be retrieved from Site Preferences and replaced in the URL in the web service integration code. No username or password are required for authentication. Instead, an access token will be retrieved from a masked Site Preference to be included in the request header.

shoppay.api.storefront

Endpoint: https://{store_id}.myshopify.com/api/{storefront_api_version}/graphql.json

Username: (leave blank/omit)

Password: (leave blank/omit)

The store_id and storefront_api_version will be retrieved from Site Preferences and replaced in the URL in the web service integration code. No username or password are required for authentication. Instead, an access token will be retrieved from a masked Site Preference to be included in the request header.

### 3.5. **Custom Objects**

ShopPayWebhookSubscriptions

ID: ShopPayWebhookSubscriptions

Key: id

Name: Shop Pay Webhook Subscriptions

Data Replication: Not replicable

Storage Scope: Site

Attribute Definitions:

| ID | Type | Description |
| ----- | ----- | :---: |
| id | String | Webhook Legacy Resource ID |
| topic | String | Webhook Topic |
| subscriptionId | String | GraphQL web hook ID |
| format | String | “JSON” |
| callbackUrl | String | SFCC Webhook Handler Endpoint |
| | | |

### 3.6. **Custom Attributes**

#### 3.6.1. **Order**

Group: ShopPay

| ID | Name | Type |
| ----- | ----- | ----- |
| shoppaySourceIdentifier | Shop Pay Source Identifier | string |
| shoppayOrderNumber | Shop Pay Order Number | string |
| shoppayGraphQLOrderId | Graph QL Order ID | string |
| shoppayOrderCreateWebhookReceived | Order Create Webhook Received | boolean |
| shoppayOrder note: this is a convenience attribute for simple indexing and searching of orders paid with Shop Pay | Is a Shop Pay Order | boolean |
| | | |

#### 3.6.2. **OrderPaymentInstrument**

| ID | Name | Type |
| ----- | ----- | ----- |
| shoppayPaymentToken | Shop Pay Payment Token | string |
| | | |

#### 3.6.3. **SitePreferences**

Group: ShopPay

| ID | Name | Type |
| ----- | ----- | ----- |
| shoppayPDPButtonEnabled | Shop Pay PDP Button Enabled | boolean (default false) |
| shoppayCartButtonEnabled | Shop Pay Cart Button Enabled | boolean (default false) |
| shoppayStoreId | Shopify Store ID | string |
| shopPayAdminAPIToken | Shopify Admin API Access Token | password |
| shopPayStorefrontAPIToken | Shopify Storefront API Access Token | password |
| shoppayAdminAPIVersion | Shopify Admin API Version | string |
| shoppayStorefrontAPIVersion | Shopify Storefront API Version | string |
| shoppayABTestEnabled | Shop Pay A/B Testing Enabled | boolean |
| | | |

## 4. **Server Side and Back End: Scripts and Controllers**

### 4.1. **Custom Controllers**

General notes:

1. Use resource bundles for any error messages so that an integrator can easily update the error messaging.
2. All shop pay custom controllers should confirm that Shop Pay is enabled before proceeding with the controller logic. Use the toggle on the Shop Pay payment method, rather than a site preference, to verify the status. For the Cart-Show, Product-Show, and Checkout-Begin appends just return next(). For the custom ShopPay controllers, return the error status (error: true, errorMessage: string)
3. All error handling flows should include error logging.
4. All debug, error, etc. logging should be handled in a dedicated “ShopPay” logger.

#### 4.1.1. **ShopPay-GetCartSummary**

- Type: GET
- Controller is called via ajax from client-side scripts
- Use csrfProtection.validateAjaxRequest from the middleware to validate the CSRF token. CSRF token should be passed in as a query parameter on the ajax request (?csrf_token=xxx).
- Retrieves the cart info needed to populate the PaymentRequest object, which is used to instantiate the Shop Pay Payment Request session client-side
(https://shopify.dev/docs/api/commerce-components/pay#create-a-session)
- Response must include an object that matches the structure of the PaymentRequest object
- Leverage helper scripts to generate the object so it can be reused in Sitegenesis code if a
Sitegenesis version is built in the future. This also allows reusability by web services if needed.

#### 4.1.2. **ShopPay-BeginSession**

- Type: POST
- Inputs:
   - current payment request object from client-side Shop Pay session
- Controller is called via ajax from the client-side Shop Pay “sessionrequested“ event handler
- Use csrfProtection.validateAjaxRequest from the middleware to validate the CSRF token. CSRF token should be passed in as a query parameter on the ajax request (csrf_token=xxx).
- Use a helper script (to allow for customization) to verify that the current cart is eligible for Shop Pay checkout. Throw an error if any checks fail. Criteria to be considered:
   - At least one product line item in the cart
   - No BOPIS items in the cart
   - Only one shipment in the cart
   - Cart has total > $0
   - Use PaymentMethod.isApplicable(customer : Customer, countryCode : String, paymentAmount : Number) to leverage OOTB max/min order totals, country restrictions, etc.
- Call the ShopPayPaymentRequestSessionCreate web service
- returns:
   - token, checkoutUrl, sourceIdentifier from ShopPayPaymentRequestSessionCreate web service request
   - status (error: true/false, errorMessage: string/null)

#### 4.1.3. **ShopPay-DiscountCodeChanged**

- Controller is called via ajax POST request from the client-side Shop Pay “discountcodechanged“ event handler
- Type: POST
- Inputs:
   - current payment request object from client-side Shop Pay session
   - discountCodes value from Shopify modal event
- Use csrfProtection.validateAjaxRequest from the middleware to validate the CSRF token. CSRF token should be passed in as a query parameter on the ajax request (csrf_token=xxx).
- Compares list of discount codes received from front end to list currently stored on the SFCC cart to determine whether to apply or remove coupons
   - compare input list to coupon line items in basket
- If discountCodes contains a coupon code not in the coupon line items, use all logic from Cart-AddCoupon controller to add the necessary coupon code to the basket
- If coupon line items have a coupon code that is not in the discountCodes list, use most of the logic from Cart-RemoveCouponLineItem controller
   - Remove identified coupon line item(s) from basket
   - Call basketCalculationHelpers.calculateTotals(currentBasket)
   - Error handling
- Leverages the helpers from the payment request model to update the discount codes, line items, subtotal, discounts, totalTax, and total in the payment request object - returns:
   - updated payment request object with latest cart totals and discounts
   - status (error: true/false, errorMessage: string/null)

#### 4.1.4. **ShopPay-ShippingAddressChanged**

- Controller is called via ajax from the client-side Shop Pay “shippingaddresschanged“ event handler
- Type: POST
- Inputs:
   - current payment request object from client-side Shop Pay session
   - shippingAddress value from Shopify modal event
- Use csrfProtection.validateAjaxRequest from the middleware to validate the CSRF token. CSRF token should be passed in as a query parameter on the ajax request (csrf_token=xxx).
- Uses logic normally called in the CheckoutShippingServices-SubmitShipping and CheckoutShippingServices-UpdateShippingMethodsList controllers
   - Calls a helper function that verifies that all required address fields are populated. This will allow an integrator to easily override to integrate 3rd party
address validation or custom logic like PO box exclusions.
   - Uses a helper script to set the new shipping address on the correct shipment This will allow an integrator to easily override for custom shipment splitting scenarios.
      - Probably want to return the identified shipment for use in determining applicable shipping methods
   - Call validationHelpers.validateProducts(currentBasket)
   - ShippingHelpers.getApplicableShippingMethods(shipment, address)
(shippingHelpers.js)
   - Include a helper script to post-filter the applicable shipping methods.
      - Remove BOPIS methods using the storePickupEnabled custom attribute on the shipping method
      - Additional logic can be provided by an integrator via script override
- Recalculate the basket so that taxes and totals are updated in the SFCC cart, even though these don’t seem to be needed for the controller response object
- Leverages the helpers from the payment request model to update the delivery methods in the payment request object
- returns:
   - updated payment request object with latest cart totals
   - status (error: true/false, errorMessage: string/null)

#### 4.1.5. **ShopPay-DeliveryMethodChanged**

- Controller is called via ajax from the client-side Shop Pay “deliverymethodchanged“ event handler
- Type: POST
- Inputs
   - current payment request object from client-side Shop Pay session
   - deliveryMethod value from Shopify modal event
- Use csrfProtection.validateAjaxRequest from the middleware to validate the CSRF token. CSRF token should be passed in as a query parameter on the ajax request (csrf_token=xxx).
- Uses logic normally called in the CheckoutShippingServices-SelectShippingMethod controller
   - Use a helper script to assign the selected delivery method to the correct shipment. May be able to use the existing ShippingHelper.selectShippingMethod(shipment, shippingMethodID).
      - This will allow an integrator to easily override for custom shipment
splitting scenarios
   - Recalculate the basket
- Leverages the helpers from the payment request model to update the shipping lines and total in the payment request object
- returns:
   - updated payment request object
   - status (error: true/false, errorMessage: string/null)

#### 4.1.6. **ShopPay-SubmitPayment**

General Notes:

1. Order should remain in created state pending receipt of ORDERS_CREATE webhook from Shopify. Do not call OrderMgr.placeOrder() during the checkout flow.
2. Defer sending the confirmation email until the ORDERS_CREATE webhook has been successfully processed. This should happen very shortly after order placement, possibly up to a few minutes if the hook is not received and is picked up by the reconciliation job instead. TBD - or are we better off just sending this right away and following with a cancellation email if some number of retries via reconciliation job fail (or webhook returns some kind of failure notice), since the customer has already seen the order confirmation page anyway.

Implementation Details:

- Controller is called via ajax from the client-side Shop Pay
“paymentconfirmationrequested“ event handler
- Type: POST
- Inputs:
   - current payment request object from client-side Shop Pay session
   - Shop Pay session token
- Use csrfProtection.validateAjaxRequest from the middleware to validate the CSRF token. CSRF token should be passed in as a query parameter on the ajax request (csrf_token=xxx).
- Recalculate the cart to ensure totals and taxes are all up to date
- Verify that the payment request passed in the ajax request from the front end is consistent with the current SFCC cart (regenerate the full object in SFCC and compare). This should include validating the basket UUID saved in the session.
   - Returns an error along with updated payment request with latest SFCC cart details if there is a mismatch and skips subsequent steps below
- Complete the pre-payment checkout logic normally called in the CheckoutServices SubmitShipping controller
   - Ensure No empty shipments (if consistency check passes above, this condition should be always true)
   - Ensure that all shipments have a shipping address and shipping method assigned
      - Use a helper function for this so that the integrator can override for custom shipment splitting scenarios like e-gift card
- Completes pre-payment checkout logic normally called in the CheckoutServices SubmitPayment controller
   - Clear/set the billing address on the order using dw.order.LineItemCtnr.createBillingAddress() - all fields will be null. Billing address will be populated from the CREATE_ORDERS webhook response later.
  - Include and implement the app.payment.form.processor.shoppay hook (TBD - is this actually needed for this flow given that there is No payment form to process. Any other logic we want/need to put in here?)
   - Call validationHelpers.validateProducts(currentBasket)
   - Include and implement the app.payment.processor.shoppay handle hook
      - Remove any existing payment instruments from the cart (no split payments allowed with Shop Pay)
      - Create the payment instrument for the Shop Pay payment for the complete order total (no split payments)
      - Set the payment method on the payment instrument
- Completes payment authorization and order creation logic normally called in the CheckoutServices-PlaceOrder logic
   - Check session for fraudDetectionStatus and throw error if found
      - (req.session.privacyCache.get('fraudDetectionStatus'))
   - Call hook app.validate.order validateOrder and throw error if validation fails
   - Validate the payment instrument using existing function COHelpers.validatePayment(req, currentBasket)
   - Recalculate the payment transaction using existing function COHelpers.calculatePaymentTransaction(currentBasket)
   *Compare to Client-side Payment Request amount.*
   - Converts basket to an order OrderMgr.createOrder(). Order will be in created state and remain in that state until the ORDERS_CREATE webhook is received and handled.
   - Implement the app.payment.process authorization hook. This hook:
      - Makes a web service call to the Shopify Storefront API.
      - On successful completion of the web service call:
         - Removes the basket UUID from the session and saves it to custom attribute “shoppaySourceIdentifier” on the Order
         - Sets the “shoppayPaymentToken” on the payment instrument to the value of the token returned in the web service response
   - Auth the payment using existing function COHelpers.handlePayments(order, order.orderNo). This function in turn calls the auth hook, above. Implement error handling for this function AFTER the postAuthorization hook, below.
   - Call hook app.post.auth postAuthorization, which allows an integrator to append custom auth or order logic like populating custom attributes for OMS or other downstream systems
      - Include error handling as per the OOTB CheckoutServices-PlaceOrder controller
   - Call the app.fraud.detection fraudDetection hook and handle the response as per the OOTB CheckoutServices-PlaceOrder controller
      - Use a helper function for the fail order piece instead of directly calling OrderMgr.failOrder to allow for a possible auth reversal call and/or other custom logic
   - Save the shipping address to the (registered) customer’s address book, if it is not already there
      - Leverage existing helpers addressHelpers.checkIfAddressStored and addressHelpers.saveAddress
- returns:
   - status (error: true/false, errorMessage: string/null)
   - orderID: order.orderNo
   - orderToken: order.orderToken
   - continueUrl: URLUtils.url('Order-Confirm').toString()

### 4.2. **Controller Extensions**

#### 4.2.1. **Cart-Show**

- Calls a helper function to determine if the Shop Pay button should be rendered on the page (allows for customization by an integrator). Should include, at a minimum, the following site preference checks:
   - Shop Pay is enabled (use the payment method toggle as the master switch, rather than a custom site preference)
   - A/B test not enabled (during A/B test the Shop Pay script tag will be included on all pages via another mechanism)
   - Shop Pay cart button enabled
   - Call PaymentMethod.isApplicable(customer : Customer, countryCode : String, paymentAmount : Number) to leverage OOTB max/min order totals, country restrictions, etc.
- Adds an attribute to pdict that will be used to control the inclusion of the Shop Pay script tag and button on the cart page (rough example snippet below).
- Adds an attribute to pdict to assign the Shop Pay URLs to pdict. These URLs will be assigned to a window var for use by the client-side JS during checkout.
- Generates a CSRF token to embed in the Shop Pay button URL for use in ajax calls to the ShopPay controllers (note: the middleware verifies that a CSRF token is not already set in the viewData before generating a new token).

```javascript
server.append('Show', csrfProtection.generateToken, function(req, res, next) {
  var cartHelpers = require(*/cartridge/scripts/...);
  res.viewData.includeShopPayJS =
  cartHelpers.getShopPayEligibility(res.viewData.basket);
  res.viewData.ShopPayUrlsString =
  require('*/cartridge/config/shoppayUrls');
  next();
});
```

#### 4.2.2. **Product-Show**

- Calls a helper function to determine if the Shop Pay button should be rendered on the page (allows for customization by an integrator). Should include, at a minimum, the following site preference checks:
   - Shop Pay is enabled (use the payment method toggle as the master switch, rather than a custom site preference)
   - A/B test not enabled (during A/B test the Shop Pay script tag will be included on all pages via another mechanism)
   - Shop Pay cart button enabled
   - Call PaymentMethod.isApplicable(customer : Customer, countryCode : String, paymentAmount : Number) to leverage OOTB max/min order totals, country restrictions, etc.
- Adds an attribute to pdict that will be used to control the inclusion of the Shop Pay script tag and button on the PDP (see example snippet in Cart-Show).
- Adds an attribute to pdict to assign the Shop Pay URLs to pdict. These URLs will be assigned to a window var for use by the client-side JS during checkout.
- Generates a CSRF token to embed in the Shop Pay button URL for use in ajax calls to the ShopPay controllers (note: the middleware verifies that a CSRF token is not already set in the viewData before generating a new token).

#### 4.2.3. **Checkout-Begin**

- Calls a helper function to determine if the Shop Pay button should be rendered on the page (allows for customization by an integrator). Should include, at a minimum, the following site preference checks:

   - Shop Pay is enabled (use the payment method toggle as the master switch, rather than a custom site preference)

   - A/B test not enabled (during A/B test the Shop Pay script tag will be included on all pages via another mechanism)

   - Shop Pay cart button enabled
   - Call PaymentMethod.isApplicable(customer : Customer, countryCode : String, paymentAmount : Number) to leverage OOTB max/min order totals, country restrictions, etc.

- Adds an attribute to pdict that will be used to control the inclusion of the Shop Pay script tag and button on the cart page (see example snippet in Cart-Show).

- Adds an attribute to pdict to assign the Shop Pay URLs to pdict. These URLs will be assigned to a window var for use by the client-side JS during checkout.

- Generates a CSRF token to embed in the Shop Pay button URL for use in ajax calls to the ShopPay controllers (note: the middleware verifies that a CSRF token is not already set in the viewData before generating a new token).

#### 4.2.4. **Helper Scripts**

Payment **Request Model**

In some cases a complete model will need to be rendered from scratch. In other cases, only specific elements of the model need to be generated, so modularity will be important (this also allows for easier extensions and overrides if needed by an integrator). Using helper scripts instead of complete sub-models will help facilitate this. See details below.

**cartridge/models/paymentrequest.js**

- contains a constructor that takes a dw.order.LineItemContainer object (basket or order) and isFinalSubmit boolean as inputs

   - isFinalSubmit flag will be used to determine whether to populate the idempotencyKey and paymentMethod in the payment request object

- Use helper functions in separate files to generate individual elements of the model. Suggested file structure is below. Use export functions for each element for modularity. Proposed structure is subject to change if code/logical interdependencies between elements exist. The “shoppay” in the file path is necessary to distinguish between native SFRA helper scripts and avoid unintentional conflicts.

   - cartridge/scripts/shoppay/helpers/shippingHelpers.js
      - getShippingAddress
      - getShippingLines
      - getApplicableDeliveryMethods (consider using the OOTB SFRA helper function here)
   - cartridge/scripts/shoppay/helpers/paymentHelpers.js
      - getPaymentMethod
      - getLocale
      - getPresentmentCurrency
   - cartridge/scripts/shoppay/helpers/productLineItemHelpers.js
      - getLineItems
   - cartridge/scripts/shoppay/helpers/discountHelpers.js
      - getDiscountCodes
      - getDiscounts
   - cartridge/scripts/shoppay/helpers/totalsHelpers.js
      - getSubtotal
      - getTotalShippingPrice
      - getTotalTax
      - getTotal
- Returns a paymentRequest object consistent with the structure described in Shopify Storefront API

#### 4.2.5. **Shop Pay URLs**

**cartridge/config/shoppayUrls.js**

- Exports a json structure of URLs needed by the client-side JS during Shop Pay checkout to access the back end controllers

   - ShopPay-GetCartSummary
   - ShopPay-BeginSession
   - ShopPay-DiscountCodeChanged
   - ShopPay-ShippingAddressChanged
   - ShopPay-DeliveryMethodChanged
   - ShopPay-SubmitPayment
- Example partial script snippet:

```javascript
'use strict';
const URLUtils = require('dw/web/URLUtils');
module.exports = {
  getCartSummary: URLUtils.https('ShopPay
  GetCartSummary').toString(),
  beginSession: URLUtils.https('ShopPay-BeginSession').toString()
};
```

### 4.3. **Web Services**

All web services should implement a helper function for log filtering (request and response) to allow for web service logging on production environments. Refer to dw.svc.ServiceCallback methods filterLogMessage, getRequestLogMessage, getResponseLogMessage.

**Shopify Storefront API (GraphQL)**

Used for server to server communications with Shop Pay during the Shop Pay checkout flow. Endpoint, API spec, and auth details here: Shopify Storefront API

**Shopify Admin API (GraphQL)**

Used for server to server communications for post-order processing

Endpoint, API spec, and auth details here: Shopify Admin API

### 4.4. **Shopify Storefront API**

#### 4.4.1. **External Documentation**

https://shopify.dev/docs/api/commerce-components/pay#api-reference-graphql-pre-payment

https://shopify.dev/docs/api/storefront

#### 4.4.2. **SFCC Implementation Details**

Endpoint: https://{shopify_store_id}.myshopify.com/api/2024-01/graphql.json

Service Type: GraphQL (HTTP)

Request Type: POST (all GraphQL requests are POST requests to the same endpoint) Request Headers:

| Key | Value |
| ----- | ----- |
| X-Shopify-Storefront-Access-Token | access token from Shopify app |
| Content-Type | application/json |
| | |

#### 4.4.3. **ShopPayPaymentRequestSessionCreate**

GraphQL Type: Mutation

Sample Request:

```json
{
  "query": "mutation shopPayPaymentRequestSessionCreate($sourceIdentifier: String!, $paymentRequest: ShopPayPaymentRequestInput!) {
    shopPayPaymentRequestSessionCreate(sourceIdentifier: $sourceIdentifier, paymentRequest: $paymentRequest) {
      shopPayPaymentRequestSession {
        token
        sourceIdentifier
        checkoutUrl
        paymentRequest {
          total
          ...
        }
      }
      userErrors {
        field
        message
      }
    }
  }",
  "variables": {
    "sourceIdentifier": "4-uprJbDGgqbLq42JH_Cl43q8mSVYyMuXXI=",
    "paymentRequest": {
      "shippingAddress": null,
      "discountCodes": [
        "LOYALTY15"
      ],
      "lineItems": [
        {
          "label": "T-Shirt",
          "quantity": 2,
          "sku": "M1234",
          "requiresShipping": true,
          "image": {
            "url": "https://example.com/myshirtimage.jpg",
            "alt": "Red T-Shirt"
          },
          "originalItemPrice": {
            "amount": 10.00,
            "currencyCode": "USD"
          },
          "itemDiscounts": [],
          "finalItemPrice": {
            "amount": 10.00,
            "currencyCode": "USD"
          },
          "originalLinePrice": {
            "amount": 20.00,
            "currencyCode": "USD"
          },
          "lineDiscounts": [],
          "finalLinePrice": {
            "amount": 20.00,
            "currencyCode": "USD"
          }
        }
      ],
      "shippingLines": [],
      "deliveryMethods": [],
      "locale": "en",
      "presentmentCurrency": "USD",
      "subtotal": {
        "amount": 20.00,
        "currencyCode": "USD"
      },
      "discounts": [
        {
          "label": "15% off",
          "amount": {
            "amount": 3.00,
            "currencyCode": "USD"
          }
        }
      ],
      "total": {
        "amount": 17.00,
        "currencyCode": "USD"
      }
    }
  }
}
```

#### 4.4.4. **ShopPayPaymentRequestSessionSubmit**

GraphQL Type: Mutation

Sample Request:

```json
{
  "query": "mutation shopPayPaymentRequestSessionSubmit($token: String!, $paymentRequest: ShopPayPaymentRequest, $idempotencyKey: String!) {shopPayPaymentRequestSession(token: $token, paymentRequest: $paymentRequest, idempotencyKey: $idempotencyKey) {paymentRequestReceipt {token processingStatusType} userErrors {field message}}}",
  "variables": {
    "sourceIdentifier": "4-uprJbDGgqbLq42JH_Cl43q8mSVYyMuXXI=",
    "idempotencyKey": "724cd96154ae352f77ca064022",
    "paymentRequest": {
      "paymentMethod": "db4eede13822684b13a607823b7ba40d",
      "shippingAddress": {
        "countryCode": "US",
        "postalCode": "60661",
        "provinceCode": null,
        "city": "Chicago",
        "firstName": "Jane",
        "lastName": "Doe",
        "address1": "500 W Madison St",
        "address2": "Ste 2200",
        "phone": "3125551212",
        "email": "jane.doe@example.com",
        "companyName": null
      },
      "discountCodes": [
        "LOYALTY15"
      ],
      "lineItems": [
        {
          "label": "T-Shirt",
          "quantity": 2,
          "sku": "M1234",
          "requiresShipping": true,
          "image": {
            "url": "https://example.com/myshirtimage.jpg",
            "alt": "Red T-Shirt"
          },
          "originalItemPrice": {
            "amount": 10.00,
            "currencyCode": "USD"
          },
          "itemDiscounts": [],
          "finalItemPrice": {
            "amount": 10.00,
            "currencyCode": "USD"
          },
          "originalLinePrice": {
            "amount": 20.00,
            "currencyCode": "USD"
          },
          "lineDiscounts": [],
          "finalLinePrice": {
            "amount": 20.00,
            "currencyCode": "USD"
          }
        }
      ],
      "shippingLines": [
        {
          "label": "Standard",
          "amount": {
            "amount": 10.00,
            "currencyCode": "USD"
          },
          "code": "STANDARD"
        }
      ],
      "deliveryMethods": [
        {
          "label": "Standard",
          "amount": {
            "amount": 0.00,
            "currencyCode": "USD"
          },
          "code": "STANDARD",
          "detail": "Ground Shipping",
          "minDeliveryDate": "2024-01-01",
          "maxDeliveryDate": "2026-01-01",
          "deliveryExpectation": "Orders ship within 2 business days"
        },
        {
          "label": "Express",
          "amount": {
            "amount": 20.00,
            "currencyCode": "USD"
          },
          "code": "EXPRESS",
          "detail": "2-day Shipping",
          "minDeliveryDate": "2024-01-01",
          "maxDeliveryDate": "2025-01-01",
          "deliveryExpectation": "Order ships same business day if order placed before 12pm EST"
        }
      ],
      "locale": "en",
      "presentmentCurrency": "USD",
      "subtotal": {
        "amount": 20.00,
        "currencyCode": "USD"
      },
      "discounts": [
        {
          "label": "15% off",
          "amount": {
            "amount": 3.00,
            "currencyCode": "USD"
          }
        }
      ],
      "totalShippingPrice": {
        "discounts": [
          {
            "label": "free shipping",
            "amount": {
              "amount": 10.00,
              "currencyCode": "USD"
            }
          }
        ],
        "originalTotal": {
          "amount": 10.00,
          "currencyCode": "USD"
        },
        "finalTotal": {
          "amount": 0.00,
          "currencyCode": "USD"
        }
      },
      "totalTax": {
        "amount": 1.06,
        "currencyCode": "USD"
      },
      "total": {
        "amount": 18.06,
        "currencyCode": "USD"
      }
    }
  }
}
```

#### 4.4.5. **Request Element Mappings**

| Request Element | Type | Required? |
| ----- | ----- | ----- |
| sourceIdentifier | string | yes |
| idempotencyKey | string | not required for SessionCreate, required for SessionSubmit |
| shippingAddress | object | No |
| paymentMethod | string | not required for SessionCreate, required for SessionSubmit |
| discountCodes | string | No |
| lineItems | object | yes |

#### 4.4.6. **SFCC Source**

LineItemCtnr.UUID

dw.util.UUIDUtils.createUUID() (https://shopify.dev/docs/api/usage/ide

LineItemCtnr.defaultShippingAddress

Session or basket attribute (value is retuthe SessionSubmit response)

LineItemCtnr.couponLineItems[i].coupLineItemCtnr.productLineItems


| lineItem.label | string | yes |
| ----- | :---- | :---- |
| lineItem.quantity | number | yes |
| lineItem.sku | string | No |
| lineItem.requiresShipping | boolean | No (defaults to true) |
| lineItem.image | string | No |
| lineItem.originalItemPrice | object | No |
| lineItem.itemDiscounts | array of discounts | No |
| lineItem.finalItemPrice (unit price) | object | yes |
| lineItem.originalLinePrice | object | No |
| lineItem.lineDiscounts | object | No |
| lineItem.finalLinePrice | object | yes |
| shippingLines | object | yes |
| deliveryMethods | object | yes |
| deliveryMethod.code | string | yes |
| deliveryMethod.label | string | yes |
| deliveryMethod.detail | string | No |
| deliveryMethod.amount | object | yes |
| deliveryMethod.minDeliveryDate | ISO date string | yes TBD: confirm this is required |
| deliveryMethod.maxDeliveryDate | ISO date string | yes TBD: confirm this is required |
| deliveryMethod.deliveryExpectationLabel string | | No |

ProductLineItem.productName ProductLineItem.product

ProductLineItem.productID

Set to false if ProductLineItem.custom.populated*

ProductLineItem.product.getImages('s

ProductLineItem.basePrice / quantityVaProductLineItem.priceAdjustments.lengconsider rounding impacts)

TBD: This one could be a little tricky ifdiscount is limited to 1 unit

ProductLineItem.adjustedNetPrice / quaconsider rounding impacts)

ProductLineItem.basePrice

ProductLineItem.priceAdjustments ProductLineItem.adjustedNetPrice

LineItemCtnr.allLineItems[i] instance - dw.order.shippingLineItem

ShippingMgr.getShipmentShippingMot - shippingHelpers.js → getApplicable

ShippingMethod.ID

ShippingMethod.displayName ShippingMethod.description

ShipmentShippingModel.getShippingCTBD: This would be custom logic per c

TBD: This would be custom logic per cShippingMethod.custom.estimatedArri

| locale | ISO string | yes |
| :---- | :---- | :---- |
| presentmentCurrency | ISO string | yes |
| subtotal | object | yes |
| discounts | array of discounts | No |
| totalShippingPrice | object | No |
| totalTax | object | No |
| total | object | yes |

Locale.getLocale(request.locale).ISO3Lshould this just be language or both lanwhere applicable, e.g., en_US)

LineItemCtnr.currencyCode

LineItemCtnr.merchandiseTotalNetPric this should be total not adjusted)

LineItemCtnr.priceAdjustments (order l

LineItemCtnr.adjustedShippingTotalNeLineItemCtnr.totalTax

LineItemCtnr.totalGrossPrice (TBD - clogic needed for discounts, etc.)*

*Provide an extension point/override capability for the request builder for customizations around image view types, digital products (no shipping), etc. Recommendation: use a custom model for this to allow easy overrides for specific attributes/blocks.

### 4.5. **Shopify Admin API**

#### 4.5.1. **External Documentation**

https://shopify.dev/docs/api/commerce-components/pay#api-reference-graphql-post-payment
https://shopify.dev/docs/api/admin-graphql

#### 4.5.2. **SFCC Implementation Details**

Endpoint: https://{shopify_store_id}.myshopify.com/admin/api/2024-01/graphql.json Service Type: GraphQL (HTTP)

Request Type: POST (all GraphQL requests are POST requests to the same endpoint) Request Headers:

| Key | Value |
| ----- | ----- |
| | X-Shopify-Access-Token access token from Shopify app |
| Content-Type | application/json |

#### 4.5.3. **Get Order By Source Identifier**

Used for the reconciliation job.

GraphQL Type: Query

Sample Request:

```json
{
  "query": "query {
    orders(first: 10, query: "source_identifier:'123'") {
      edges {
        node {
          id
          name
          sourceIdentifier
          billingAddress {
            firstName
            lastName
            address1
            address2
            city
            provinceCode
            countryCodeV2
            phone
          }
        }
      }
    }
  }",
  "variables": {}
}
```

Sample Response:

```json
{
  "data": {
    "orders": {
      "edges": [
        {
          "node": {
            "id": "gid://shopify/Order/5484566315301",
            "name": "#1004",
            "sourceIdentifier": "123",
            "billingAddress": {
              "firstName": "Jane",
              "lastName": "Doe",
              "address1": "500 W Madison St",
              "address2": null,
              "city": "Chicago",
              "provinceCode": "IL",
              "countryCodeV2": "US",
              "phone": null
            }
          }
        }
      ]
    }
  },
  "extensions": {
    "cost": {
      "requestedQueryCost": 22,
      "actualQueryCost": 22,
      "throttleStatus": {
        "maximumAvailable": 1000,
        "currentlyAvailable": 799,
        "restoreRate": 50
      }
    }
  }
}
```

#### 4.5.4. **Get Order Transactions**

GraphQL Type: Query

Sample Request:

```json
{
  "query": "{
    order(id: "gid://shopify/Order/5484566184229") {
      capturable
      transactions {
        amountSet {
          presentmentMoney {
            amount
            currencyCode
          }
        }
        id
        kind
        manuallyCapturable
      }
    }
  }",
  "variables": {}
}
```

Sample Response:

```json
{
  "data": {
    "order": {
      "capturable": false,
      "transactions": [
        {
          "amountSet": {
            "presentmentMoney": {
              "amount": "885.95",
              "currencyCode": "USD"
            }
          },
          "id": "gid://shopify/OrderTransaction/6654314381605",
          "kind": "SALE",
          "manuallyCapturable": false
        }
      ]
    }
  },
  "extensions": {
    "cost": {
      "requestedQueryCost": 3,
      "actualQueryCost": 3,
      "throttleStatus": {
        "maximumAvailable": 1000.0,
        "currentlyAvailable": 997,
        "restoreRate": 50.0
      }
    }
  }
}
```

#### 4.5.5. **Payment Capture**

GraphQL Type: Mutation

Sample Request:

```json
{
  "query": "mutation orderCapture($input: OrderCaptureInput!) {
    orderCapture(input: $input) {
      transaction {
        id
        amountSet {
          shopMoney {
            amount
            currencyCode
          }
          presentmentMoney {
            amount
            currencyCode
          }
        }
        kind
        status
      }
      userErrors {
        field
        message
      }
    }
  }",
  "variables": {
    "input": {
      "amount": "10.00",
      "currency": "USD",
      "id": "gid://shopify/order/1",
      "parentTransactionId": "gid://shopify/OrderTransaction/1"
    }
  }
}
```

Sample Response:

```json
{
  "orderCapture": {
    "transaction": {
      "id": "gid://shopify/OrderTransaction/1",
      "amountSet": {
        "shopMoney": {
          "amount": "10.00",
          "currencyCode": "USD"
        },
        "presentmentMoney": {
          "amount": "10.00",
          "currencyCode": "USD"
        }
      },
      "kind": "CAPTURE",
      "status": "SUCCESS"
    },
    "userErrors": []
  }
}
```

#### 4.5.6. **Get Order Fulfillment Orders**

GraphQL Type: Query

Sample Request:

```json
{
  "query": "{
    order(id: "gid://shopify/Order/5484566184229") {
      name
      sourceIdentifier
      displayFulfillmentStatus
      fulfillmentOrders(first: 5) {
        edges {
          node {
            id
            deliveryMethod {
              serviceCode
              methodType
            }
            status
          }
        }
      }
    }
  }",
  "variables": {}
}
```

Sample Response:

```json
{
  "data": {
    "order": {
      "name": "#1001",
      "sourceIdentifier": "45f200d85f54c1e09e185813714972a2",
      "displayFulfillmentStatus": "UNFULFILLED",
      "fulfillmentOrders": {
        "edges": [
          {
            "node": {
              "id": "gid://shopify/FulfillmentOrder/6425322881317",
              "deliveryMethod": {
                "serviceCode": "custom",
                "methodType": "SHIPPING"
              },
              "status": "OPEN"
            }
          }
        ]
      }
    }
  },
  "extensions": {
    "cost": {
      "requestedQueryCost": 13,
      "actualQueryCost": 5,
      "throttleStatus": {
        "maximumAvailable": 1000.0,
        "currentlyAvailable": 995,
        "restoreRate": 50.0
      }
    }
  }
}
```

#### 4.5.7. **Fulfillment Tracking**

GraphQL Type: Mutation

Sample Request:

```json
{
  "query": "mutation fulfillmentCreateV2($fulfillment: FulfillmentV2Input!) {
    fulfillmentCreateV2(fulfillment: $fulfillment) {
      fulfillment {
        id
        status
        trackingInfo(first: 10) {
          company
          number
          url
        }
      }
      userErrors {
        field
        message
      }
    }
  }",
  "variables": {
    "fulfillment": {
      "lineItemsByFulfillmentOrder": {
        "fulfillmentOrderId": "gid://shopify/FulfillmentOrder/1"
      },
      "trackingInfo": {
        "company": "UPS",
        "number": "1Z001985YW99744790"
      }
    }
  }
}
```

Sample Response:

```json
{
  "data": {
    "fulfillmentCreateV2": {
      "fulfillment": {
        "id": "gid://shopify/Fulfillment/1",
        "status": "SUCCESS",
        "trackingInfo": [
          {
            "company": "UPS",
            "number": "1Z001985YW99744790",
            "url": "https://www.ups.com/WebTracking?loc=en_US&requester=ST&trackNums=1Z001985YW99744790"
          }
        ]
      },
      "userErrors": []
    }
  },
  "extensions": {
    "cost": {
      "requestedQueryCost": 11,
      "actualQueryCost": 11,
      "throttleStatus": {
        "maximumAvailable": 1000.0,
        "currentlyAvailable": 989,
        "restoreRate": 50.0
      }
    }
  }
}
```

#### 4.5.8. **Refund Creation**

GraphQL Type: Mutation

Sample Request:

```json
{
  "query": "mutation refundCreate($input: RefundInput!) {
    refundCreate(input: $input) {
      refund {
        id
        transactions(first: 10) {
          nodes {
            id
            kind
            status
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }",
  "variables": {
    "input": {
      "currency": "USD",
      "note": "Customer returned item",
      "orderId": "gid://shopify/Order/1",
      "transactions": [
        {
          "amount": "10.00",
          "gateway": "shopify_payments",
          "kind": "REFUND",
          "orderId": "gid://shopify/Order/1",
          "parentId": "gid://shopify/OrderTransaction/1"
        }
      ]
    }
  }
}
```

Sample Response:

```json
{
  "data": {
    "refundCreate": {
      "refund": {
        "id": "gid://shopify/Refund/1",
        "transactions": {
          "nodes": [
            {
              "id": "gid://shopify/OrderTransaction/2",
              "kind": "REFUND",
              "status": "PENDING"
            }
          ]
        }
      },
      "userErrors": []
    }
  },
  "extensions": {
    "cost": {
      "requestedQueryCost": 32,
      "actualQueryCost": 32,
      "throttleStatus": {
        "maximumAvailable": 1000.0,
        "currentlyAvailable": 968,
        "restoreRate": 50.0
      }
    }
  }
}
```

#### 4.5.9. **WebHook Subscribe**

GraphQL Type: Mutation

Sample Request:

```json
{
  "query": "mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
    webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
      userErrors {
        field
        message
      }
      webhookSubscription {
        id
        legacyResourceId
        format
        topic
        endpoint {
          __typename
          ... on WebhookHttpEndpoint {
            callbackUrl
          }
        }
      }
    }
  }",
  "variables": {
    "topic": "ORDERS_CREATE",
    "webhookSubscription": {
      "format": "JSON",
      "callbackUrl": "https://mystore.com/webhooks/orders/create"
    }
  }
}
```

Sample Response:

```json
{
  "data": {
    "webhookSubscriptionCreate": {
      "userErrors": [],
      "webhookSubscription": {
        "id": "gid://shopify/WebhookSubscription/1448729248037",
        "legacyResourceId": "1448729248037",
        "format": "JSON",
        "topic": "ORDERS_CREATE",
        "endpoint": {
          "__typename": "WebhookHttpEndpoint",
          "callbackUrl": "https://example.org/endpoint"
        }
      }
    }
  },
  "extensions": {
    "cost": {
      "requestedQueryCost": 11,
      "actualQueryCost": 11,
      "throttleStatus": {
        "maximumAvailable": 1000,
        "currentlyAvailable": 989,
        "restoreRate": 50
      }
    }
  }
}
```

## 5. **Jobs**

### 5.1. **Shopify Webhook Subscribe**

- Job inputs:
   - webhook topic
      - use an enum for this attribute if possible, otherwise just verify against an array of possible topics on the back end to ensure the topic is allowed/valid.
   - webhook callbackUrl (TBD - maybe omit and just map this on the back end in a helper function that could be overridden if a customer wants to customize or allow as input).
- Makes a GraphQL call to the admin API for the webhookSubscriptionCreate mutation
   - Sets the callbackUrl for the webhook (use absolute URL reference)
      - Webhooks-OrdersCreate controller
- Upon success:
   - stores the following details from the response in a WebhookSubscriptions custom object
      - id: web hook legacy Resource ID (numerical string e.g., 1369147703589)
      - topic
      - subscriptionId: id (graphQL string e.g., gid://shopify/WebhookSubscription/1369147703589)
      - format
      - callbackUrl
- Upon failure - see if GraphQL response error message indicates a subscription to this topic with this callback URL already exists. If so, create/update the custom object for it as above using the topic to find potential matches to existing custom objects. Sample error response for this scenario:

```json
{
  "data": {
    "webhookSubscriptionCreate": {
      "userErrors": [
        {
          "field": [
            "webhookSubscription",
            "callbackUrl"
          ],
          "message": "Address for this topic has already been taken"
        }
      ],
      "webhookSubscription": null
    }
  },
  "extensions": {
    ...
  }
}
```

### 5.2. **Order Reconciliation**

- Job inputs
   - Lookback time (hrs). This can be an optional attribute, used to prevent stuck orders from being retried for an excessive number of job executions.
- Searches for and processes any SFCC orders that meet the following criteria:
   - Order status = created
   - Order.custom.isShopPayOrder = true
   - Order.custom.shoppayOrderCreateWebhookReceived = !true (false/empty/null)
- Uses the source_identifier attribute from the SFCC order to find the associated Shopify order (this correlates to order custom attribute shoppaySourceIdentifier)
   - Makes a GraphQL call to Shopify to retrieve the order.
   - If order is not found in Shopify, continue to the next order in the search results
- Sets custom attribute “shoppayOrderNumber” to the Shopify order number received in the QraphQL response on the SFCC order (for correlation/reference)
   - QraphQL response attribute: name
- Sets custom attribute “shoppayGraphQLOrderId” to the Shopify GraphQL order ID received in the webhook payload on the SFCC order (for correlation/reference and OMS use in post-order processing)
   - QraphQL response attribute: id
- Sets the billing address on the order from the QraphQL response
- Uses a helper script to update order statuses and call OrderMgr.placeOrder (this allows override for custom logic if needed)
   - Export Status: Not Exported → Ready for Export
   - Refer to logic in checkoutHelpers.placeOrder(order, fraudDetectionStatus) - Sets custom attribute “shoppayOrderCreateWebhookReceived” to true on the SFCC order
- Sends the order confirmation email. TBD - or are we better off just sending this right away and following with a cancellation email if some number of retries via reconciliation job fail (or webhook returns some kind of failure notice), since the customer has already seen the order confirmation page anyway.

### 5.3. **Webhooks**

#### 5.3.1. **ORDERS_CREATE**

**Subscription**

Web hook subscription will be performed by manual trigger of an SFCC job. Refer to https://themazegroup.atlassian.net/wiki/spaces/SSPSC/pages/2592768007/Jobs#Shopify-Web Hook-Subscribe for details.

**Handler**

**Controller: Webhooks-OrdersCreate**

- Receives the payload from the Shopify ORDERS_CREATE webhook
   - Sample payload:

```json
{
  "id": 820982911946154500,
  "admin_graphql_api_id": "gid://shopify/Order/820982911946154508",
  "app_id": null,
  "browser_ip": null,
  "buyer_accepts_marketing": true,
  "cancel_reason": "customer",
  "cancelled_at": "2021-12-31T19:00:00-05:00",
  "cart_token": null,
  "checkout_id": null,
  "checkout_token": null,
  "client_details": null,
  "closed_at": null,
  "confirmation_number": null,
  "confirmed": false,
  "contact_email": "jon@example.com",
  "created_at": "2021-12-31T19:00:00-05:00",
  "currency": "USD",
  "current_subtotal_price": "398.00",
  "current_subtotal_price_set": {
    "shop_money": {
      "amount": "398.00",
      "currency_code": "USD"
    },
    "presentment_money": {
      "amount": "398.00",
      "currency_code": "USD"
    }
  },
  "current_total_additional_fees_set": null,
  "current_total_discounts": "0.00",
  "current_total_discounts_set": {
    "shop_money": {
      "amount": "0.00",
      "currency_code": "USD"
    },
    "presentment_money": {
      "amount": "0.00",
      "currency_code": "USD"
    }
  },
  "current_total_duties_set": null,
  "current_total_price": "398.00",
  "current_total_price_set": {
    "shop_money": {
      "amount": "398.00",
      "currency_code": "USD"
    },
    "presentment_money": {
      "amount": "398.00",
      "currency_code": "USD"
    }
  },
  "current_total_tax": "0.00",
  "current_total_tax_set": {
    "shop_money": {
      "amount": "0.00",
      "currency_code": "USD"
    },
    "presentment_money": {
      "amount": "0.00",
      "currency_code": "USD"
    }
  },
  "customer_locale": "en",
  "device_id": null,
  "discount_codes": [],
  "email": "jon@example.com",
  "estimated_taxes": false,
  "financial_status": "voided",
  "fulfillment_status": "pending",
  "landing_site": null,
  "landing_site_ref": null,
  "location_id": null,
  "merchant_of_record_app_id": null,
  "name": "#9999",
  "note": null,
  "note_attributes": [],
  "number": 234,
  "order_number": 1234,
  "order_status_url": "https://jsmith.myshopify.com/548380009/orders/123456abcd/authenticate?key=abcdefg",
  "original_total_additional_fees_set": null,
  "original_total_duties_set": null,
  "payment_gateway_names": [
    "visa",
    "bogus"
  ],
  "phone": null,
  "po_number": null,
  "presentment_currency": "USD",
  "processed_at": null,
  "reference": null,
  "referring_site": null,
  "source_identifier": null,
  "source_name": "web",
  "source_url": null,
  "subtotal_price": "388.00",
  "subtotal_price_set": {
    "shop_money": {
      "amount": "388.00",
      "currency_code": "USD"
    },
    "presentment_money": {
      "amount": "388.00",
      "currency_code": "USD"
    }
  },
  "tags": "",
  "tax_exempt": false,
  "tax_lines": [],
  "taxes_included": false,
  "test": true,
  "token": "123456abcd",
  "total_discounts": "20.00",
  "total_discounts_set": {
    "shop_money": {
      "amount": "20.00",
      "currency_code": "USD"
    },
    "presentment_money": {
      "amount": "20.00",
      "currency_code": "USD"
    }
  },
  "total_line_items_price": "398.00",
  "total_line_items_price_set": {
    "shop_money": {
      "amount": "398.00",
      "currency_code": "USD"
    },
    "presentment_money": {
      "amount": "398.00",
      "currency_code": "USD"
    }
  },
  "total_outstanding": "398.00",
  "total_price": "388.00",
  "total_price_set": {
    "shop_money": {
      "amount": "388.00",
      "currency_code": "USD"
    },
    "presentment_money": {
      "amount": "388.00",
      "currency_code": "USD"
    }
  },
  "total_shipping_price_set": {
    "shop_money": {
      "amount": "10.00",
      "currency_code": "USD"
    },
    "presentment_money": {
      "amount": "10.00",
      "currency_code": "USD"
    }
  },
  "total_tax": "0.00",
  "total_tax_set": {
    "shop_money": {
      "amount": "0.00",
      "currency_code": "USD"
    },
    "presentment_money": {
      "amount": "0.00",
      "currency_code": "USD"
    }
  },
  "total_tip_received": "0.00",
  "total_weight": 0,
  "updated_at": "2021-12-31T19:00:00-05:00",
  "user_id": null,
  "billing_address": {
    "first_name": "Steve",
    "address1": "123 Shipping Street",
    "phone": "555-555-SHIP",
    "city": "Shippington",
    "zip": "40003",
    "province": "Kentucky",
    "country": "United States",
    "last_name": "Shipper",
    "address2": null,
    "company": "Shipping Company",
    "latitude": null,
    "longitude": null,
    "name": "Steve Shipper",
    "country_code": "US",
    "province_code": "KY"
  },
  "customer": {
    "id": 115310627314723950,
    "email": "john@example.com",
    "accepts_marketing": false,
    "created_at": null,
    "updated_at": null,
    "first_name": "John",
    "last_name": "Smith",
    "state": "disabled",
    "note": null,
    "verified_email": true,
    "multipass_identifier": null,
    "tax_exempt": false,
    "phone": null,
    "email_marketing_consent": {
      "state": "not_subscribed",
      "opt_in_level": null,
      "consent_updated_at": null
    },
    "sms_marketing_consent": null,
    "tags": "",
    "currency": "USD",
    "accepts_marketing_updated_at": null,
    "marketing_opt_in_level": null,
    "tax_exemptions": [],
    "admin_graphql_api_id": "gid://shopify/Customer/115310627314723954",
    "default_address": {
      "id": 715243470612851200,
      "customer_id": 115310627314723950,
      "first_name": null,
      "last_name": null,
      "company": null,
      "address1": "123 Elm St.",
      "address2": null,
      "city": "Ottawa",
      "province": "Ontario",
      "country": "Canada",
      "zip": "K2H7A8",
      "phone": "123-123-1234",
      "name": "",
      "province_code": "ON",
      "country_code": "CA",
      "country_name": "Canada",
      "default": true
    }
  },
  "discount_applications": [],
  "fulfillments": [],
  "line_items": [
    {
      "id": 866550311766439000,
      "admin_graphql_api_id": "gid://shopify/LineItem/866550311766439020",
      "attributed_staffs": [
        {
          "id": "gid://shopify/StaffMember/902541635",
          "quantity": 1
        }
      ],
      "fulfillable_quantity": 1,
      "fulfillment_service": "manual",
      "fulfillment_status": null,
      "gift_card": false,
      "grams": 567,
      "name": "IPod Nan - 8GB",
      "price": "199.00",
      "price_set": {
        "shop_money": {
          "amount": "199.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "199.00",
          "currency_code": "USD"
        }
      },
      "product_exists": true,
      "product_id": 632910392,
      "properties": [],
      "quantity": 1,
      "requires_shipping": true,
      "sku": "IPOD2008PINK",
      "taxable": true,
      "title": "IPod Nano - 8GB",
      "total_discount": "0.00",
      "total_discount_set": {
        "shop_money": {
          "amount": "0.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "0.00",
          "currency_code": "USD"
        }
      },
      "variant_id": 808950810,
      "variant_inventory_management": "shopify",
      "variant_title": null,
      "vendor": null,
      "tax_lines": [],
      "duties": [],
      "discount_allocations": []
    },
    {
      "id": 141249953214522980,
      "admin_graphql_api_id": "gid://shopify/LineItem/141249953214522974",
      "attributed_staffs": [],
      "fulfillable_quantity": 1,
      "fulfillment_service": "manual",
      "fulfillment_status": null,
      "gift_card": false,
      "grams": 567,
      "name": "IPod Nano - 8GB",
      "price": "199.00",
      "price_set": {
        "shop_money": {
          "amount": "199.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "199.00",
          "currency_code": "USD"
        }
      },
      "product_exists": true,
      "product_id": 632910392,
      "properties": [],
      "quantity": 1,
      "requires_shipping": true,
      "sku": "IPOD2008PINK",
      "taxable": true,
      "title": "IPod Nano - 8GB",
      "total_discount": "0.00",
      "total_discount_set": {
        "shop_money": {
          "amount": "0.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "0.00",
          "currency_code": "USD"
        }
      },
      "variant_id": 808950810,
      "variant_inventory_management": "shopify",
      "variant_title": null,
      "vendor": null,
      "tax_lines": [],
      "duties": [],
      "discount_allocations": []
    }
  ],
  "payment_terms": null,
  "refunds": [],
  "shipping_address": {
    "first_name": "Steve",
    "address1": "123 Shipping Street",
    "phone": "555-555-SHIP",
    "city": "Shippington",
    "zip": "40003",
    "province": "Kentucky",
    "country": "United States",
    "last_name": "Shipper",
    "address2": null,
    "company": "Shipping Company",
    "latitude": null,
    "longitude": null,
    "name": "Steve Shipper",
    "country_code": "US",
    "province_code": "KY"
  },
  "shipping_lines": [
    {
      "id": 271878346596884000,
      "carrier_identifier": null,
      "code": null,
      "discounted_price": "10.00",
      "discounted_price_set": {
        "shop_money": {
          "amount": "10.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "10.00",
          "currency_code": "USD"
        }
      },
      "phone": null,
      "price": "10.00",
      "price_set": {
        "shop_money": {
          "amount": "10.00",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "10.00",
          "currency_code": "USD"
        }
      },
      "requested_fulfillment_service_id": null,
      "source": "shopify",
      "title": "Generic Shipping",
      "tax_lines": [],
      "discount_allocations": []
    }
  ]
}
```

- Uses the source_identifier attribute from the payload to find the associated SFCC order (this correlates to order custom attribute shoppaySourceIdentifier)
- Sets custom attribute “shoppayOrderNumber” to the Shopify order number received in the webhook payload on the SFCC order (for correlation/reference)
   - payload attribute: order_number
- Sets custom attribute “shoppayGraphQLOrderId” to the Shopify GraphQL order ID received in the webhook payload on the SFCC order (for correlation/reference and OMS use in post-order processing)
   - payload attribute: admin_graphql_api_id
- Sets the billing address on the order from the webhook payload
- Uses a helper script to update order statuses and call OrderMgr.placeOrder (this allows override for custom logic if needed)
   - Export Status: Not Exported → Ready for Export
   - Refer to logic in checkoutHelpers.placeOrder(order, fraudDetectionStatus) - Sets custom attribute “shoppayOrderCreateWebhookReceived” to true on the SFCC order
- Sends the order confirmation email. TBD - or are we better off just sending this right away and following with a cancellation email if some number of retries via reconciliation job fail (or webhook returns some kind of failure notice), since the customer has already seen the order confirmation page anyway.

### 5.3.2. **ORDER_TRANSACTIONS_CREATE**

https://shopify.dev/docs/api/admin-graphql/2023-10/enums/OrderTransactionKind
