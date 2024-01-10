# Shop Pay Salesforce Commerce Cloud Cartridge

## storefront-reference-architecture (SFRA)

This link cartridge is based off of [storefront-reference-architecture](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture) `v6.3.0` and is included into the project using [Git Subtree](https://gist.github.com/SKempin/b7857a6ff6bddb05717cc17a44091202)

## About git Subtree

When you use subtree, you add the subtree to an existing repository where the subtree is a reference to another repository url and branch/tag. This add command adds all the code and files into the main repository locally; it's not just a reference to a remote repo.

When you stage and commit files for the main repo, it will add all of the remote files in the same operation. The subtree checkout will pull all the files in one pass, so there is no need to try and connect to another repo to get the portion of subtree files, because they were already included in the main repo.

## Install dependencies

This project was built using node `v14.21.3` but any version of node 14 will work. [Node Version Manager](https://github.com/nvm-sh/nvm) or `nvm` is an easy way to use different versions of node

Install

`npm install && npm run sfra:init`

The above will install both project and SFRA dependencies

## Local Development

You can use the VS Code [Prophet Debugger](https://marketplace.visualstudio.com/items?itemName=SqrTT.prophet) extension

## CI/CD

The project uses a custom build solution which simply finds, zips, uploads, and activates bundled code to a specified instance.

## Authors

Erik Marty - erik@themazegroup.com
