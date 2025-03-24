# Shop Component Connector Reference Code
# for Salesforce Commerce Cloud SFRA
# Technical Specifications

## Table of Contents

[1. General Architecture](#1-general-architecture)

   * [1.1. Cartridge Structure](#11-cartridge-structure)

      * [1.1.1. Cartridges](#111-cartridges)

      * [1.1.2. Documentation](#112-documentation)

      * [1.1.3. Metadata](#113-metadata)

      * [1.1.4. Test](#114-test)

      * [1.1.5. Config files (loose files, not in a subfolder)](#115-config-files-loose-files-not-in-a-subfolder)

   * [1.2. Checkout Flow](#12-checkout-flow)

   * [1.3. Post-Payment Processing](#13-post-payment-processing)

      * [1.3.1. SFCC Scope](#131-sfcc-scope)

      * [1.3.2. SFCC Starter Logic](#132-sfcc-starter-logic)

      * [1.3.3. Defer to OMS with Guidance](#133-defer-to-oms-with-guidance)

[2. Client Side and Frontend](#2-client-side-and-frontend)

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

[4. Server Side and Backend: Scripts and Controllers](#4-server-side-and-backend-scripts-and-controllers)

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

   * [5.3. Webhooks - ORDERS_CREATE](#53-webhooks---orders_create)

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
   - Controller extensions, template overrides, and helper scripts that are required only for A/B testing of Shop Component vs control (Merchant-assigned A/B testing)

#### 1.1.2. Documentation

The following additional resources are available:

- [README](./README.md)
- [Integration guide](./INTEGRATION_GUIDE.md)

#### 1.1.3. Metadata

- Structure this folder for zip and import via SFCC business manager (Site Import & Export)

#### 1.1.4. Test

- Unit/integration testing scripts

#### 1.1.5. Config files (loose files, not in a subfolder)

- package.json
- etc.

### 1.2. **Checkout Flow**

Source: https://shopify.dev/docs/api/commerce-components/pay#sequence-diagram

### 1.3. **Post-Payment Processing**

#### 1.3.1. **SFCC Scope**

- `ORDERS_CREATE` webhook handling and reconciliation job

#### 1.3.2. **SFCC Starter Logic**

- Payment capture
   - Web service call
   - Job framework
   - Leave order/export/payment status handling up to the end user to customize/implement (will need to override at least one helper function in the place order flow)

#### 1.3.3. **Defer to OMS with Guidance**

- Order risks handling
- `ORDER_TRANSACTIONS_CREATE` webhook handling
- `DISPUTES_CREATE`, `DISPUTES_UPDATE` webhook handling
- Fulfillment tracking
- Refund creation

## 2. **Client Side and Frontend**

### 2.1. **Script Include**

```javascript
<script src="https://cdn.shopify.com/shopifycloud/shop-js/shop-pay-payment-request.js"></script>
```

- Leverage the `app.template.htmlHead` hook in `htmlHead.isml` to include the script tag
- Add a pdict var to the `Cart-Show`, `Product-Show`, and `Checkout-Begin` and any other relevant controllers to include the script on specific pages.
- Include logic in the hook to render the script tag on ALL site pages during merchant assigned A/B testing (and A/A testing)

Sample (rough) implementation of the `htmlHead(pdict)` hook function and template:

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

Use a data attribute on the Shop Pay button on Cart, PDP, and Checkout pages to include the CSRF token provided by an append to each page controller. This token needs to be appended to the controller URL as an http parameter `?csrf_token=xxx` for security when ajax calls are made from the Shop Pay event handlers. Example shown below.

```javascript
<div id="shop-pay-button-wrapper" data-tokenName="${pdict.csrf.tokenName}" data-token="${pdict.csrf.token}">
  <div id="shop-pay-button-container"></div>
</div>
```

### 2.2. **Client Side JS**

#### 2.2.1. General Notes

All event handler controllers will return information about error status, specifically `error`: `true`/`false`, `errorMsg`: string/null.

If `error` = `true`, send the errors object, instead of the `paymentRequestObject`, to the event completion handler to abort the Shop Pay payment flow (and render a message in the Shop Pay modal, where applicable).

#### 2.2.2. Documentation

https://shopify.dev/docs/api/commerce-components/pay#shoppayusererror

### 2.3. **Event Listeners and Handlers**

#### 2.3.1. **Creating a session**

- Gets CSRF token from hidden data attribute on the page
- Calls the `ShopPay-GetCartSummary` controller via AJAX
   - Sets `csrf_token` as an http parameter in the ajax request URL
   - Receives JSON response containing the `PaymentRequest` object
   - Sets `shippingAddress` to null (in the event a registered customer already has their primary address set on the cart, Shop Pay addresses should take precedence) and set `deliveryMethods` to `[]`.
- Create session by calling `ShopPay.PaymentRequest.createSession` from the Shop Pay SDK passing the `paymentRequest` object form the AJAX call above

#### 2.3.2. **sessionrequested**

- Gets CSRF token from hidden data attribute on the page
- Calls the `ShopPay-BeginSession` controller via AJAX
   - Sets `csrf_token` as an http parameter in the ajax request URL
   - Receives JSON response containing the `token`, `checkoutUrl`, and `sourceIdentifier`
   - After the ASYNC AJAX response is received `session.completeSessionRequest` is called using the data retuned by `Shop-BeginSession`
   - This verifies the session allowing the Shop Pay Popup to start the checkout process

#### 2.3.3. **discountcodechanged**

- Gets CSRF token from hidden data attribute on the page
- Calls the `ShopPay-DiscountCodeChanged` controller via AJAX
   - Sets `csrf_token` as an http parameter in the ajax request URL
   - Provides updated `discountCodes` object so the controller can update the order totals and discounts
   - Receives JSON response containing the updated `lineItems` array
- Calls `window.ShopPay.PaymentRequest.build` using spread operator and replacing `lineItems` with the array provided by the response above to build a new `paymentRequest` object
- Calls `session.completeDiscountCodeChange` from the Shop Pay SDK passing it the updated `paymentRequest` object

#### 2.3.4. **shippingaddresschanged**

- Gets CSRF token from hidden data attribute on the page
- Calls the `ShopPay-ShippingAddressChanged` controller via AJAX
   - Sets `csrf_token` as an http parameter in the ajax request URL
   - Provides updated `shippingAddress` object so the controller return updated delivery methods
   - Receives JSON response containing the updated `deliveryMethods` array
   - Calls `window.ShopPay.PaymentRequest.build` using spread operator and replacing `deliveryMethods` with the array provided by the response above to build a new `paymentRequest` object
- Calls `session.completeShippingAddressChange` from the Shop Pay SDK passing it the updated `paymentRequest` object

#### 2.3.5. **deliverymethodchanged**

- Gets CSRF token from hidden data attribute on the page
- Calls the `ShopPay-DeliveryMethodChanged` controller via AJAX
   - Sets `csrf_token` as an http parameter in the ajax request URL
   - Provides updated `deliveryMethod` object so the controller return updated shippings lines and totals
   - Receives JSON response containing the updated shippingLines array and totals object
- Calls `window.ShopPay.PaymentRequest.build` using spread operator and replacing `deliveryMethods` with the array provided by the response above to build a new `paymentRequest` object
- Calls `session.completeDeliveryMethodChange` from the Shop Pay SDK passing it the updated `paymentRequest` object

#### 2.3.6. **paymentconfirmationrequested**

- If order is valid according to business logic that can be added in this function
  - Example if total amount is greater than 1000 call `session.completePaymentConfirmationRequest` passing errors object to display the error in the Shop Pay Popup
- Gets CSRF token from hidden data attribute on the page
- Calls the `ShopPay-ShippingSubmitPayment` controller via AJAX
   - Sets `csrf_token` as an http parameter in the ajax request URL
   - Provides `session.token` and `session.paymentRequest`
   - Receives JSON response containing any possible errors
      - On success, call `session.completePaymentConfirmationRequest` from the Shop Pay SDK

#### 2.3.7. **paymentcomplete**

- If event `processingStatus.status` equals `completed` , call `session.close` and redirect to the order confirmation page.
- Data elements `continueUrl`, `orderID`, and `orderToken` will be returned by the Shop Pay `SubmitPayment` controller.
- Sample redirect implementation (refer to `checkout/checkout.js` in the included SFRA client-side JS)

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

There are multiple events that can occur on the PDP and Cart pages in which the cart contents are updated, but the page is not refreshed (e.g, quantity update, removal in mini-cart, add to cart). In these scenarios, the `paymentRequest` object in the Shop Pay session (initialized on page load), would be out of date when the Shop Pay button is clicked and the modal is opened. Due to complications in tracking and handling these events within the Shop Pay-specific JS and session, the `paymentRequest` object should be updated at the time the customer clicks on the Shop Pay button (use a wrapper, if necessary, to listen for this event).

Upon clicking the Shop Pay button in Cart and PDP,

- Call the `ShopPay-GetCartSummary` controller via AJAX to get the
`updatedPaymentRequest` object from the SFCC backend
- Set the `shippingAddress` to null (in the event a registered customer already has their primary address set on the cart, Shop Pay addresses should take precedence) and set `deliveryMethods` to `[]` in the payment Request object.
- Push the `paymentRequest` object to the Shop Pay session:

```javascript
session.completeDiscountCodeChange({updatedPaymentRequest: updatedPaymentRequest})
```

### 2.4. **Shop Pay Button Styles**

Shop Pay branding guidance for the Shop Pay buttons:

https://shopify.dev/docs/api/commerce-components/pay/design-guidelines#specs-and-customization

### 2.5. **Template Overrides**

- The following code needs to be include on the PDP and Checkout templates:

https://shopify.dev/docs/api/commerce-components/pay#javascript-sdk-for-buttons-and-email-recognition

- Add a data attribute (`data-token`) to the shop pay button wrapper that can be scraped and appended to the URL in ajax calls to the Shop Pay controllers.

## 3. **Meta Data and Configurations**

### 3.1. **General Guidelines**

1. Use the same prefix (shoppay) on all Shop Pay-specific custom attributes so they can be clearly linked to this integration.
2. Use camel case for custom attribute IDs

### 3.2. **Payment Methods**

ShopPay

### 3.3. **Payment Processors**

SHOPPAY

### 3.4. **Web Services**

**shoppay.api.admin**

Endpoint: https://{store_id}.myshopify.com/admin/api/{admin_api_version}/graphql.json

Username: (leave blank/omit)

Password: (leave blank/omit)

The `store_id` and `admin_api_version will be retrieved from Site Preferences and replaced in the URL in the web service integration code. No username or password are required for authentication. Instead, an access token will be retrieved from a masked Site Preference to be included in the request header.

**shoppay.api.storefront**

Endpoint: https://{store_id}.myshopify.com/api/{storefront_api_version}/graphql.json

Username: (leave blank/omit)

Password: (leave blank/omit)

The `store_id` and `storefront_api_version` will be retrieved from Site Preferences and replaced in the URL in the web service integration code. No username or password are required for authentication. Instead, an access token will be retrieved from a masked Site Preference to be included in the request header.

### 3.5. **Custom Objects**

**ShopPayWebhookSubscriptions**

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
| format | String | `JSON` |
| callbackUrl | String | SFCC Webhook Handler Endpoint |
| | | |

### 3.6. **Custom Attributes**

#### 3.6.1. **Order**

Group: Shop Pay

| ID | Name | Type |
| ----- | ----- | ----- |
| shoppaySourceIdentifier | Shop Pay Source Identifier | string |
| shoppayOrderNumber | Shop Pay Order Number | string |
| shoppayGraphQLOrderId | Graph QL Order ID | string |
| shoppayOrderCreateWebhookReceived | Order Create Webhook Received | boolean |
| shoppayOrder | Is a Shop Pay Order | boolean |
| | | |

>Note: shoppayOrder is a convenience attribute for simple indexing and searching of orders paid with Shop Pay

#### 3.6.2. **OrderPaymentInstrument**

| ID | Name | Type |
| ----- | ----- | ----- |
| shoppayPaymentToken | Shop Pay Payment Token | string |
| | | |

#### 3.6.3. **SitePreferences**

Group: Shop Pay

| ID | Name | Type |
| ----- | ----- | ----- |
| shoppayPDPButtonEnabled | Shop Pay PDP Button Enabled | boolean (default `false`) |
| shoppayCartButtonEnabled | Shop Pay Cart Button Enabled | boolean (default `false`) |
| shoppayStoreId | Shopify Store ID | string |
| shopPayAdminAPIToken | Shopify Admin API Access Token | password |
| shopPayStorefrontAPIToken | Shopify Storefront API Access Token | password |
| shoppayAdminAPIVersion | Shopify Admin API Version | string |
| shoppayStorefrontAPIVersion | Shopify Storefront API Version | string |
| shoppayABTestEnabled | Shop Pay A/B Testing Enabled | boolean |
| | | |

## 4. **Server Side and Backend: Scripts and Controllers**

### 4.1. **Custom Controllers**

General notes:

1. Use resource bundles for any error messages so that an integrator can easily update the error messaging.
2. All shop pay custom controllers should confirm that Shop Pay is enabled before proceeding with the controller logic. Use the toggle on the Shop Pay payment method, rather than a site preference, to verify the status. For the `Cart-Show`, `Product-Show`, and `Checkout-Begin` appends just return `next()`. For the custom Shop Pay controllers, return the error status (`error`: `true`, `errorMessage`: string)
3. All error handling flows should include error logging.
4. All debug, error, etc. logging should be handled in a dedicated `ShopPay` logger.

#### 4.1.1. **ShopPay-GetCartSummary**

- Type: `GET`
- Controller is called via ajax from client-side scripts
- Use `csrfProtection.validateAjaxRequest` from the middleware to validate the CSRF token. CSRF token should be passed in as a query parameter on the ajax request (`?csrf_token=xxx`).
- Retrieves the cart info needed to populate the `PaymentRequest` object, which is used to instantiate the Shop Pay Payment Request session client-side
(https://shopify.dev/docs/api/commerce-components/pay#create-a-session)
- Response must include an object that matches the structure of the PaymentRequest object
- Leverage helper scripts to generate the object so it can be reused in SiteGenesis code if a
SiteGenesis version is built in the future. This also allows reusability by web services if needed.

#### 4.1.2. **ShopPay-BeginSession**

- Type: `POST`
- Inputs:
   - Current payment request object from client-side Shop Pay session
- Controller is called via ajax from the client-side Shop Pay `sessionrequested` event handler
- Use `csrfProtection.validateAjaxRequest` from the middleware to validate the CSRF token. CSRF token should be passed in as a query parameter on the ajax request (`csrf_token=xxx`).
- Use a helper script (to allow for customization) to verify that the current cart is eligible for Shop Pay checkout. Throw an error if any checks fail. Criteria to be considered:
   - At least one product line item in the cart
   - No BOPIS items in the cart
   - Only one shipment in the cart
   - Cart has total > $0
   - Use `PaymentMethod.isApplicable(customer : Customer, countryCode : String, paymentAmount : Number)` to leverage default max/min order totals, country restrictions, etc.
- Call the `ShopPayPaymentRequestSessionCreate` web service
- Returns:
   - `token`, `checkoutUrl`, `sourceIdentifier` from `ShopPayPaymentRequestSessionCreate` web service request
   - `status` (`error`: `true`/`false`, `errorMessage`: string/null)

#### 4.1.3. **ShopPay-DiscountCodeChanged**

- Controller is called via ajax POST request from the client-side Shop Pay `discountcodechanged` event handler
- Type: `POST`
- Inputs:
   - Current payment request object from client-side Shop Pay session
   - `discountCodes` value from Shopify modal event
- Use `csrfProtection.validateAjaxRequest` from the middleware to validate the CSRF token. CSRF token should be passed in as a query parameter on the ajax request (`csrf_token=xxx`).
- Compares list of discount codes received from frontend to list currently stored on the SFCC cart to determine whether to apply or remove coupons
   - Compare input list to coupon line items in basket
- If `discountCodes` contains a coupon code not in the coupon line items, use all logic from `Cart-AddCoupon` controller to add the necessary coupon code to the basket
- If coupon line items have a coupon code that is not in the `discountCodes` list, use most of the logic from `Cart-RemoveCouponLineItem` controller
   - Remove identified coupon line item(s) from basket
   - Call `basketCalculationHelpers.calculateTotals(currentBasket)`
   - Error handling
- Leverages the helpers from the payment request model to update the discount codes, line items, subtotal, discounts, totalTax, and total in the payment request object
- Returns:
   - Updated payment request object with latest cart totals and discounts
   - `status` (`error`: `true`/`false`, `errorMessage`: string/null)

#### 4.1.4. **ShopPay-ShippingAddressChanged**

- Controller is called via ajax from the client-side Shop Pay `shippingaddresschanged` event handler
- Type: `POST`
- Inputs:
   - Current payment request object from client-side Shop Pay session
   - `shippingAddress` value from Shopify modal event
- Use `csrfProtection.validateAjaxRequest` from the middleware to validate the CSRF token. CSRF token should be passed in as a query parameter on the ajax request (`c`srf_token=xxx`).
- Uses logic normally called in the `CheckoutShippingServices-SubmitShipping` and `CheckoutShippingServices-UpdateShippingMethodsList` controllers
   - Calls a helper function that verifies that all required address fields are populated. This will allow an integrator to easily override to integrate 3rd party
address validation or custom logic like PO box exclusions.
   - Uses a helper script to set the new shipping address on the correct shipment This will allow an integrator to easily override for custom shipment splitting scenarios.
      - You may want to return the identified shipment for use in determining applicable shipping methods
   - Call `validationHelpers.validateProducts(currentBasket)`
   - `ShippingHelpers.getApplicableShippingMethods(shipment, address)`
(`shippingHelpers.js`)
   - Include a helper script to post-filter the applicable shipping methods.
      - Remove BOPIS methods using the `storePickupEnabled` custom attribute on the shipping method
      - Additional logic can be provided by an integrator via script override
- Recalculate the basket so that taxes and totals are updated in the SFCC cart, even though these don’t seem to be needed for the controller response object
- Leverages the helpers from the payment request model to update the delivery methods in the payment request object
- Returns:
   - Updated payment request object with latest cart totals
   - `status` (`error`: `true`/`false`, `errorMessage`: string/null)

#### 4.1.5. **ShopPay-DeliveryMethodChanged**

- Controller is called via ajax from the client-side Shop Pay `deliverymethodchanged` event handler
- Type: `POST`
- Inputs:
   - Current payment request object from client-side Shop Pay session
   - `deliveryMethod` value from Shopify modal event
- Use `csrfProtection.validateAjaxRequest` from the middleware to validate the CSRF token. CSRF token should be passed in as a query parameter on the ajax request (`csrf_token=xxx`).
- Uses logic normally called in the `CheckoutShippingServices-SelectShippingMethod` controller
   - Use a helper script to assign the selected delivery method to the correct shipment. May be able to use the existing `ShippingHelper.selectShippingMethod(shipment, shippingMethodID)`.
      - This will allow an integrator to easily override for custom shipment splitting scenarios
   - Recalculate the basket
- Leverages the helpers from the payment request model to update the shipping lines and total in the payment request object
- Returns:
   - Updated payment request object
   - `status` (`error`: `true`/`false`, `errorMessage`: string/null)

#### 4.1.6. **ShopPay-SubmitPayment**

General Notes:

1. Order should remain in created state pending receipt of `ORDERS_CREATE` webhook from Shopify. Do not call `OrderMgr.placeOrder()` during the checkout flow.
2. Defer sending the confirmation email until the `ORDERS_CREATE` webhook has been successfully processed. This should happen very shortly after order placement, possibly up to a few minutes if the hook is not received and is picked up by the reconciliation job instead.

Implementation Details:

- Controller is called via ajax from the client-side Shop Pay `paymentconfirmationrequested` event handler
- Type: `POST`
- Inputs:
   - Current payment request object from client-side Shop Pay session
   - Shop Pay session token
- Use `csrfProtection.validateAjaxRequest` from the middleware to validate the CSRF token. CSRF token should be passed in as a query parameter on the ajax request (`csrf_token=xxx`).
- Recalculate the cart to ensure totals and taxes are all up to date
- Verify that the payment request passed in the ajax request from the frontend is consistent with the current SFCC cart (regenerate the full object in SFCC and compare). This should include validating the basket UUID saved in the session.
   - Returns an error along with updated payment request with latest SFCC cart details if there is a mismatch and skips subsequent steps below
- Complete the pre-payment checkout logic normally called in the `CheckoutServices` `SubmitShipping` controller
   - Ensure No empty shipments (if consistency check passes above, this condition should always be `true`)
   - Ensure that all shipments have a shipping address and shipping method assigned
      - Use a helper function for this so that the integrator can override for custom shipment splitting scenarios like e-gift card
- Completes pre-payment checkout logic normally called in the CheckoutServices SubmitPayment controller
   - Clear/set the billing address on the order using `dw.order.LineItemCtnr.createBillingAddress()`
      - All fields will be null.
      - Billing address will be populated from the `CREATE_ORDERS` webhook response later.
  - Include and implement the `app.payment.form.processor.shoppay` hook if necessary
   - Call `validationHelpers.validateProducts(currentBasket)`
   - Include and implement the `app.payment.processor.shoppay` handle hook
      - Remove any existing payment instruments from the cart (no split payments allowed with Shop Pay)
      - Create the payment instrument for the Shop Pay payment for the complete order total (no split payments)
      - Set the payment method on the payment instrument
- Completes payment authorization and order creation logic normally called in the `CheckoutServices-PlaceOrder` logic
   - Check session for `fraudDetectionStatus` and throw error if found
      - (`req.session.privacyCache.get('fraudDetectionStatus')`)
   - Call hook `app.validate.order validateOrder` and throw error if validation fails
   - Validate the payment instrument using existing function `COHelpers.validatePayment(req, currentBasket)`
   - Recalculate the payment transaction using existing function `COHelpers.calculatePaymentTransaction(currentBasket)`
      - *Compare to Client-side Payment Request amount.*
   - Converts basket to an order `OrderMgr.createOrder()`. Order will be in created state and remain in that state until the `ORDERS_CREATE` webhook is received and handled.
   - Implement the `app.payment.process authorization` hook. This hook:
      - Makes a web service call to the Shopify Storefront API.
      - On successful completion of the web service call:
         - Removes the basket UUID from the session and saves it to custom attribute `shoppaySourceIdentifier` on the Order
         - Sets the `shoppayPaymentToken` on the payment instrument to the value of the token returned in the web service response
   - Auth the payment using existing function `COHelpers.handlePayments(order, order.orderNo)`.
      - This function in turn calls the auth hook, above.
      - Implement error handling for this function AFTER the `postAuthorization` hook, below.
   - Call hook `app.post.auth postAuthorization`, which allows an integrator to append custom auth or order logic like populating custom attributes for OMS or other downstream systems
      - Include error handling as per the included `CheckoutServices-PlaceOrder` controller
   - Call the `app.fraud.detection fraudDetection` hook and handle the response as per the included `CheckoutServices-PlaceOrder` controller
      - Use a helper function for the fail order piece instead of directly calling `OrderMgr.failOrder` to allow for a possible auth reversal call and/or other custom logic
   - Save the shipping address to the registered customer’s address book, if it is not already there
      - Leverage existing helpers `addressHelpers.checkIfAddressStored` and `addressHelpers.saveAddress`
- returns:
   - status (`error`: `true`/`false`, `errorMessage`: string/null)
   - orderID: `order.orderNo`
   - orderToken: `order.orderToken`
   - continueUrl: `URLUtils.url('Order-Confirm').toString()`

### 4.2. **Controller Extensions**

#### 4.2.1. **Cart-Show**

- Calls a helper function to determine if the Shop Pay button should be rendered on the page (allows for customization by an integrator). Should include, at a minimum, the following site preference checks:
   - Shop Pay is enabled (use the payment method toggle as the master switch, rather than a custom site preference)
   - A/B test not enabled (during A/B test the Shop Pay script tag will be included on all pages via another mechanism)
   - Shop Pay cart button enabled
   - Call `PaymentMethod.isApplicable(customer : Customer, countryCode : String, paymentAmount : Number)` to leverage default max/min order totals, country restrictions, etc.
- Adds an attribute to pdict that will be used to control the inclusion of the Shop Pay script tag and button on the cart page (rough example snippet below).
- Adds an attribute to pdict to assign the Shop Pay URLs to pdict. These URLs will be assigned to a window var for use by the client-side JS during checkout.
- Generates a CSRF token to embed in the Shop Pay button URL for use in ajax calls to the Shop Pay controllers (note: the middleware verifies that a CSRF token is not already set in the viewData before generating a new token).

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
   - Call `PaymentMethod.isApplicable(customer : Customer, countryCode : String, paymentAmount : Number)` to leverage default max/min order totals, country restrictions, etc.
- Adds an attribute to pdict that will be used to control the inclusion of the Shop Pay script tag and button on the PDP (see example snippet in `Cart-Show`).
- Adds an attribute to pdict to assign the Shop Pay URLs to pdict. These URLs will be assigned to a window var for use by the client-side JS during checkout.
- Generates a CSRF token to embed in the Shop Pay button URL for use in ajax calls to the Shop Pay controllers (note: the middleware verifies that a CSRF token is not already set in the `viewData` before generating a new token).

#### 4.2.3. **Checkout-Begin**

- Calls a helper function to determine if the Shop Pay button should be rendered on the page (allows for customization by an integrator). Should include, at a minimum, the following site preference checks:
   - Shop Pay is enabled (use the payment method toggle as the master switch, rather than a custom site preference)
   - A/B test not enabled (during A/B test the Shop Pay script tag will be included on all pages via another mechanism)
   - Shop Pay cart button enabled
   - Call `PaymentMethod.isApplicable(customer : Customer, countryCode : String, paymentAmount : Number)` to leverage default max/min order totals, country restrictions, etc.
- Adds an attribute to pdict that will be used to control the inclusion of the Shop Pay script tag and button on the cart page (see example snippet in `Cart-Show`).
- Adds an attribute to pdict to assign the Shop Pay URLs to pdict. These URLs will be assigned to a window var for use by the client-side JS during checkout.
- Generates a CSRF token to embed in the Shop Pay button URL for use in ajax calls to the Shop Pay controllers (note: the middleware verifies that a CSRF token is not already set in the `viewData` before generating a new token).

#### 4.2.4. **Helper Scripts**

Payment **Request Model**

In some cases a complete model will need to be rendered from scratch. In other cases, only specific elements of the model need to be generated, so modularity will be important (this also allows for easier extensions and overrides if needed by an integrator). Using helper scripts instead of complete sub-models will help facilitate this. See details below.

**cartridge/models/paymentrequest.js**

- contains a constructor that takes a `dw.order.LineItemContainer` object (basket or order) and `isFinalSubmit` boolean as inputs
   - `isFinalSubmit` flag will be used to determine whether to populate the `idempotencyKey` and `paymentMethod` in the payment request object
- Use helper functions in separate files to generate individual elements of the model. Suggested file structure is below. Use export functions for each element for modularity. Proposed structure is subject to change if code/logical interdependencies between elements exist. The "shoppay" in the file path is necessary to distinguish between native SFRA helper scripts and avoid unintentional conflicts.
   - cartridge/scripts/shoppay/helpers/shippingHelpers.js
      - getShippingAddress
      - getShippingLines
      - getApplicableDeliveryMethods (consider using the included SFRA helper function here)
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

- Exports a json structure of URLs needed by the client-side JS during Shop Pay checkout to access the backend controllers

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

Used for server to server communications for post-payment processes

Endpoint, API spec, and auth details here: Shopify Admin API

### 4.4. **Shopify Storefront API**

#### 4.4.1. **External Documentation**

https://shopify.dev/docs/api/commerce-components/pay#api-reference-graphql-pre-payment

https://shopify.dev/docs/api/storefront

#### 4.4.2. **SFCC Implementation Details**

Endpoint: https://{shopify_store_id}.myshopify.com/api/latest/graphql.json

Service Type: GraphQL (HTTP)

Request Type: `POST` (all GraphQL requests are POST requests to the same endpoint)

Request Headers:

| Key | Value |
| ----- | ----- |
| X-Shopify-Storefront-Access-Token | access token from Shopify app |
| Content-Type | application/json |
| | |

#### 4.4.3. **ShopPayPaymentRequestSessionCreate**

https://shopify.dev/docs/api/storefront/latest/mutations/shopPayPaymentRequestSessionCreate

#### 4.4.4. **ShopPayPaymentRequestSessionSubmit**

https://shopify.dev/docs/api/storefront/latest/mutations/shopPayPaymentRequestSessionSubmit

#### 4.4.5. **Request Element Mappings**

| Request Element | Type | Required? | SFCC source |
| ----- | ----- | ----- | ----- |
| sourceIdentifier | string | yes | `LineItemCtnr.UUID` |
| idempotencyKey | string | not required for `SessionCreate`, required for `SessionSubmit` | `dw.util.UUIDUtils.createUUID()` See https://shopify.dev/docs/api/usage/idempotent-requests |
| shippingAddress | object | No | LineItemCtnr.defaultShippingAddress |
| paymentMethod | string | not required for `SessionCreate`, required for `SessionSubmit` |
| discountCodes | string | No | Session or basket attribute (value is retuthe `SessionSubmit` response) |
| lineItems | object | yes | `LineItemCtnr.couponLineItems[i].coupLineItemCtnr.productLineItems` |
| lineItem.label | string | yes | `ProductLineItem.productName` |
| lineItem.quantity | number | yes | `ProductLineItem.product` |
| lineItem.sku | string | No | `ProductLineItem.productID` |
| lineItem.requiresShipping | boolean | No (defaults to `true`) | Set to `false` if `ProductLineItem.custom.populated*` |
| lineItem.image | string | No | `ProductLineItem.product.getImages()` |
| lineItem.originalItemPrice | object | No | `ProductLineItem.basePrice` / `quantityVa` |
| lineItem.itemDiscounts | array of discounts | No | `ProductLineItem.priceAdjustments.leng` (consider rounding impacts, may be tricky if discount is limited to 1 unit) |
| lineItem.finalItemPrice (unit price) | object | yes | `ProductLineItem.basePrice` |
| lineItem.originalLinePrice | object | No | `ProductLineItem.adjustedNetPrice` / `qua` (consider rounding impacts) |
| lineItem.lineDiscounts | object | No | `ProductLineItem.priceAdjustments` |
| lineItem.finalLinePrice | object | yes | `ProductLineItem.adjustedNetPrice` |
| shippingLines | object | yes | `LineItemCtnr.allLineItems[i] instanceo dw.order.shippingLineItem` |
| deliveryMethods | object | yes | `ShippingMgr.getShipmentShippingMoto shippingHelpers.js → getApplicable` |
| deliveryMethod.code | string | yes | `ShippingMethod.ID` |
| deliveryMethod.label | string | yes | `ShippingMethod.displayName` |
| deliveryMethod.detail | string | No | `ShippingMethod.description` |
| deliveryMethod.amount | object | yes | `ShipmentShippingModel.getShippingC` (TBD: This would be custom logic per c)
| deliveryMethod.minDeliveryDate | ISO date string | Maybe | Required unless `deliveryMethod.deliveryExpectationLabel` is prpopulated |
| deliveryMethod.maxDeliveryDate | ISO date string | Maybe | Required unless `deliveryMethod.deliveryExpectationLabel is populated` |
| deliveryMethod.deliveryExpectationLabel | string | Maybe | `ShippingMethod.custom.estimatedArri` required unless `deliveryMethod.minDeliveryDate` and `deliveryMethod.maxDeliveryDate` are populated |
| locale | ISO string | yes | `Locale.getLocale(request.locale).ISO3L` (this should just be language or both language and country where applicable, e.g., `en_US`) |
| presentmentCurrency | ISO string | yes | `LineItemCtnr.currencyCode | LineItemCtnr.priceAdjustments (order 1)` |
| subtotal | object | yes | `LineItemCtnr.merchandiseTotalNetPric` (this should be total not adjusted) |
| discounts | array of discounts | No |  |
| totalShippingPrice | object | No | `LineItemCtnr.adjustedShippingTotalNe` |
| totalTax | object | No | `LineItemCtnr.totalTax` |
| total | object | yes | `LineItemCtnr.totalGrossPrice` (TBD - clogic needed for discounts, etc.) |

*Provide an extension point/override capability for the request builder for customizations around image view types, digital products (no shipping), etc. Recommendation: use a custom model for this to allow easy overrides for specific attributes/blocks.

### 4.5. **Shopify Admin API**

#### 4.5.1. **External Documentation**

https://shopify.dev/docs/api/commerce-components/pay#api-reference-graphql-post-payment
https://shopify.dev/docs/api/admin-graphql

#### 4.5.2. **SFCC Implementation Details**

Endpoint: https://{shopify_store_id}.myshopify.com/admin/api/latest/graphql.json

Service Type: GraphQL (HTTP)

Request Type: `POST` (all GraphQL requests are POST requests to the same endpoint)

Request Headers:

| Key | Value |
| ----- | ----- |
| X-Shopify-Access-Token | Access token from Shopify app |
| Content-Type | `application/json` |

#### 4.5.3. **Get Order By Source Identifier**

Used for the reconciliation job.

https://shopify.dev/docs/api/commerce-components/pay#retrieving-order-data-using-the-source-identifier

#### 4.5.4. **Get Order Transactions**

https://shopify.dev/docs/api/admin-graphql/latest/queries/order
https://shopify.dev/docs/api/admin-graphql/latest/objects/order#field-transactions

#### 4.5.5. **Payment Capture**

https://shopify.dev/docs/api/admin-graphql/latest/mutations/orderCapture

#### 4.5.6. **Get Order Fulfillment Orders**

https://shopify.dev/docs/api/admin-graphql/latest/queries/order
https://shopify.dev/docs/api/admin-graphql/latest/objects/order#field-fulfillmentOrders

#### 4.5.7. **Fulfillment Tracking**

https://shopify.dev/docs/api/admin-graphql/latest/mutations/fulfillmentCreateV2

#### 4.5.8. **Refund Creation**

https://shopify.dev/docs/api/admin-graphql/latest/mutations/refundCreate

#### 4.5.9. **WebHook Subscribe**

https://shopify.dev/docs/api/admin-graphql/latest/mutations/webhookSubscriptionCreate

## 5. **Jobs**

### 5.1. **Shopify Webhook Subscribe**

- Job inputs:
   - Webhook topic
      - use an enum for this attribute if possible, otherwise just verify against an array of possible topics on the backend to ensure the topic is allowed/valid.
   - Webhook callbackUrl (Maybe omit and just map this on the backend in a helper function that could be overridden if a customer wants to customize or allow as input).
- Makes a GraphQL call to the admin API for the webhookSubscriptionCreate mutation
   - Sets the callbackUrl for the webhook (use absolute URL reference)
      - Webhooks-OrdersCreate controller
- Upon success:
   - Stores the following details from the response in a `WebhookSubscriptions` custom object
      - id: web hook legacy Resource ID (numerical string e.g., `1369147703589`)
      - topic
      - subscriptionId: id (graphQL string e.g., `gid://shopify/WebhookSubscription/1369147703589`)
      - format
      - callbackUrl
- Upon failure, see if GraphQL response error message indicates a subscription to this topic with this callback URL already exists. If so, create/update the custom object for it as above using the topic to find potential matches to existing custom objects. Sample error response for this scenario:

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
   - `Order.status` = `created`
   - `Order.custom.isShopPayOrder` = `true`
   - `Order.custom.shoppayOrderCreateWebhookReceived` = `false`/empty/null
- Uses the `source_identifier` attribute from the SFCC order to find the associated Shopify order (this correlates to order custom attribute `shoppaySourceIdentifier`)
   - Makes a GraphQL call to Shopify to retrieve the order.
   - If order is not found in Shopify, continue to the next order in the search results
- Sets custom attribute `shoppayOrderNumber` to the Shopify order number received in the GraphQL response on the SFCC order (for correlation/reference)
   - GraphQL response attribute: `name`
- Sets custom attribute `shoppayGraphQLOrderId` to the Shopify GraphQL order ID received in the webhook payload on the SFCC order (for correlation/reference and OMS use in post-payment processing)
   - GraphQL response attribute: `id`
- Sets the billing address on the order from the GraphQL response
- Uses a helper script to update order statuses and call `OrderMgr.placeOrder` (this allows override for custom logic if needed)
   - Export Status: Not Exported → Ready for Export
   - Refer to logic in `checkoutHelpers.placeOrder(order, fraudDetectionStatus)`
   - Sets custom attribute `shoppayOrderCreateWebhookReceived` to `true` on the SFCC order
- Sends the order confirmation email.

### 5.3. **Webhooks - ORDERS_CREATE**

**Subscription**

Webhook subscription will be performed by manual trigger of an SFCC job.

**Handler**

**Controller: Webhooks-OrdersCreate**

- Receives the payload from the Shopify `ORDERS_CREATE` webhook
- Uses the `source_identifier` attribute from the payload to find the associated SFCC order (this correlates to order custom attribute `shoppaySourceIdentifier`)
- Sets custom attribute `shoppayOrderNumber` to the Shopify order number received in the webhook payload on the SFCC order (for correlation/reference)
   - payload attribute: `order_number`
- Sets custom attribute `shoppayGraphQLOrderId` to the Shopify GraphQL order ID received in the webhook payload on the SFCC order (for correlation/reference and OMS use in post-payment processing)
   - payload attribute: `admin_graphql_api_id`
- Sets the billing address on the order from the webhook payload
- Uses a helper script to update order statuses and call `OrderMgr.placeOrder` (this allows override for custom logic if needed)
   - Export Status: Not Exported → Ready for Export
   - Refer to logic in `checkoutHelpers.placeOrder(order, fraudDetectionStatus)`
   - Sets custom attribute `shoppayOrderCreateWebhookReceived` to `true` on the SFCC order
- Sends the order confirmation email.

