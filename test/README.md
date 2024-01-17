# Test Automation

## Introduction

The following frameworks and packages are used for testing

 - [Playwright](https://playwright.dev/)
 - [mocha](https://mochajs.org/)

    - SFCC API calls are mocked & stubbed using:

        - [proxyquire](https://github.com/thlorenz/proxyquire)
        - [sinon.js](https://sinonjs.org/)
        - [dw-mock-api](https://github.com/SalesforceCommerceCloud/dw-api-mock)


### Notes:
- Playwright will output screenshots and videos to help debugging test failures*

- Debugging tests is made easy using the Playwright logger. Please refer to the `logger` block within the [Playwright Config](./playwright.config.js) and the [following documentation](https://playwright.dev/docs/api/class-logger) for more details

## Prerequisites

`node v18.16.x`

`.env` file at the root of this directory with the following variables. See [example](env.example) file

```
BASE_URL=https://<INSTANCE>.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site
```

## Instructions

- In Business Manager make sure you have added the appropriate selectors in the custom site preferences
- `npm install`
- Running tests:

    - SFRA E2E tests: `npm run test:sfra:e2e`
    - Unit Tests: `npm run test:unit`

## Coverage

End to End (E2E) tests focus on verifying event data for the following
