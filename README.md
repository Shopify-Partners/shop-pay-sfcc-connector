# Shop Pay Salesforce Commerce Cloud Cartridge

This link cartridge is based off of [storefront-reference-architecture](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture) (SFRA) `v6.3.0` and is included into the project using [Git Subtree](https://gist.github.com/SKempin/b7857a6ff6bddb05717cc17a44091202)

### About git Subtree

When you use subtree, you add the subtree to an existing repository where the subtree is a reference to another repository url and branch/tag. This add command adds all the code and files into the main repository locally; it's not just a reference to a remote repo.

When you stage and commit files for the main repo, it will add all of the remote files in the same operation. The subtree checkout will pull all the files in one pass, so there is no need to try and connect to another repo to get the portion of subtree files, because they were already included in the main repo.

## Getting Started

### Install dependencies

This project was built using node `v14.21.3` but any version of node 14 will work. [Node Version Manager](https://github.com/nvm-sh/nvm) or `nvm` is an easy way to use different versions of node

Run following:

`npm install && npm run sfra:install`

The above will install both project and SFRA dependencies

### Note the install may take a few minutes

### Local Development

You can use `npm run watch` as you develop in conjunction with the VS Code [Prophet Debugger](https://marketplace.visualstudio.com/items?itemName=SqrTT.prophet) extension

## Testing

The following frameworks and packages are used for testing

 - [mocha](https://mochajs.org/)
 - [Playwright](https://playwright.dev/)

    - SFCC API calls are mocked & stubbed using:

        - [proxyquire](https://github.com/thlorenz/proxyquire)
        - [sinon.js](https://sinonjs.org/)
        - [dw-mock-api](https://github.com/SalesforceCommerceCloud/dw-api-mock)


## Prerequisites

`.env` file at the root of this directory with the following variables. See [example](test/env.example) file

```
# Storefront URL
BASE_URL=https://<INSTANCE>.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site
# Url for integration tests
SITE_URL=https://<INSTANCE>.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site
```

### Note - Integration and E2E tests require a live and fully configured SFRA Sandbox

## Instructions

Change into the `test` directory

Run  `npm install`

- Running tests:

    - Unit Tests: `npm run test:unit`
    - Integration Tests: `npm run test:integration`
    - UI Tests: `npm run test:ui`
    - Integration + UI tests: `npm run test:e2e`
