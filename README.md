# Shop Pay Commerce Component connector reference code for Salesforce Commerce Cloud SFRA

This link cartridge reference code is based off of SFRA `v6.3.0`

## Getting Started

Below are the instructions for working with this repository. For details on the Shop Pay connector reference code contained within, please see the [INTEGRATION GUIDE](./INTEGRATION_GUIDE.md).

### Install dependencies

This project was built using node `v14.21.3` but any version of node 14 will work. [Node Version Manager](https://github.com/nvm-sh/nvm) or `nvm` is an easy way to use different versions of node

Run following:

`npm install && npm run sfra:install`

The above will install project dependencies. This may take a few minutes.

### Local Development

You can optionally use `npm run watch` as you develop in conjunction with the VS Code [Prophet Debugger](https://marketplace.visualstudio.com/items?itemName=SqrTT.prophet) extension.

## Testing

The following frameworks and packages are used for testing

- [mocha](https://mochajs.org/)
- [Playwright](https://playwright.dev/)

  - SFCC API calls are mocked & stubbed using:

    - [proxyquire](https://github.com/thlorenz/proxyquire)
    - [sinon.js](https://sinonjs.org/)
    - [dw-mock-api](https://github.com/SalesforceCommerceCloud/dw-api-mock)

### Prerequisites

`.env` file at the root of this directory with the following variables. See [example](test/env.example) file

```
# Storefront URL
BASE_URL=https://<INSTANCE>.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site
# Url for integration tests
SITE_URL=https://<INSTANCE>.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site
```

> Note:
Integration and E2E tests require a live and fully configured SFRA Sandbox, and coordination from your Shopify launch team.

### Instructions

Change into the `test` directory

Run  `npm install`

- Running tests:

  - Unit Tests: `npm run test:unit`
  - Integration Tests: `npm run test:integration`
  - UI Tests: `npm run test:ui`
  - Integration + UI tests: `npm run test:e2e`
