# SFRA Webpack builder

## Why use it?
Webpack can be cumbersome to setup, especially in multicartridge projects for SFRA.
This plugin let you bundle all your `js`, `scss` and `jsx` files out of the box.

- One pre-build `webpack.config.js` for all cartridges and plugins
- No more `sgmf-script`, which interferes with `Prophet uploader`
- Supports multicartridge projects due to simple configuration
- Supports aliases for `commonjs` or `esm` loading
- Supports eslint while watching
- Supports reuse of node_modules dependencies from other cartridges
- Supports LiveReload via [webpack-livereload-plugin](https://github.com/statianzo/webpack-livereload-plugin) and [Chrome plugin](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei). Use the command `watch:reload`.

<br/>

## Prerequisite
### Structure 1 : sfra-webpack-builder as installed module
  ```
  .
  +-- storefront-reference-**applicaton******
  +-- app_custom_myapp
  +-- plugin_one
  +-- plugin_two
  +-- package.js <-- This is the root package.json for your project. You can create it by running npm init -y
  +-- ....
  +-- node_modules
  +----- ....
  +----- sfra-webpack-builder
  +----- ....
  ```
- Install sfra-webpack-builder with npm (You need to be in the root folder of your project) : `npm install SalesforceCommerceCloud/sfra-webpack-builder#3.5.0 --save-dev` to install the latest stable version
- The latest develop version is available to install if you run the same command without the tag.
- Add the scripts to your root `package.json`
  ```json
  "swb:npm:install": "node ./node_modules/sfra-webpack-builder/installHandling/install.js",
  "swb:yarn:install": "node ./node_modules/sfra-webpack-builder/installHandling/install.js --useYarn",
  "swb:prod": "node ./node_modules/sfra-webpack-builder/webpackHandling/webpack.js --config ./node_modules/sfra-webpack-builder/webpack.config.js",
  "swb:dev": "node ./node_modules/sfra-webpack-builder/webpackHandling/webpack.js --config ./node_modules/sfra-webpack-builder/webpack.config.js --env dev",
  "swb:watch": "node ./node_modules/sfra-webpack-builder/webpackHandling/webpack.js --config ./node_modules/sfra-webpack-builder/webpack.config.js --env dev --watch",
  "swb:watch:lint": "node ./node_modules/sfra-webpack-builder/webpackHandling/webpack.js --config ./node_modules/sfra-webpack-builder/webpack.config.js --env dev --env useLinter --watch",
  "swb:watch:reload": "node ./node_modules/sfra-webpack-builder/webpackHandling/webpack.js --config ./node_modules/sfra-webpack-builder/webpack.config.js --env dev --watch --env livereload",
  ```
- Run `npm install` in the root folder of your project
- Run `npm run swb:npm:install` in the root folder of your project, to install needed dependencies for cartridges.

<br/>

### Structure 2 : sfra-webpack-builder as subfolder
In case npm cannot access the SalesforceCommerceCloud workspace on Github, this is the recommended method.
  ```
  .
  +-- storefront-reference-**applicaton******
  +-- app_custom_myapp
  +-- plugin_one
  +-- plugin_two
  +-- package.js <-- This is the root package.json for your project. You can create it by running npm init -y
  +-- ....
  +-- sfra-webpack-builder
  +-- node_modules
  +----- ....
  ```
- Download the code to `sfra-webpack-builder` at the root of your project.
- Add the scripts to your root `package.json`. Notice the use of **`--env local`**.
  ```json
  "swb:install": "cd sfra-webpack-builder && npm install --legacy-peer-deps",
  "swb:npm:install": "node ./sfra-webpack-builder/installHandling/install.js",
  "swb:yarn:install": "node ./sfra-webpack-builder/installHandling/install.js --useYarn",
  "swb:prod": "node ./sfra-webpack-builder/webpackHandling/webpack.js --config ./sfra-webpack-builder/webpack.config.js --env local",
  "swb:dev": "node ./sfra-webpack-builder/webpackHandling/webpack.js --config ./sfra-webpack-builder/webpack.config.js --env dev --env local",
  "swb:watch": "node ./sfra-webpack-builder/webpackHandling/webpack.js --config ./sfra-webpack-builder/webpack.config.js --env dev --watch --env local",
  "swb:watch:lint": "node ./sfra-webpack-builder/webpackHandling/webpack.js --config ./sfra-webpack-builder/webpack.config.js --env dev --env useLinter --watch --env local",
  "swb:watch:reload": "node ./sfra-webpack-builder/webpackHandling/webpack.js --config ./sfra-webpack-builder/webpack.config.js --env dev --watch --env local --env livereload",
  ```
- Install `sfra-webpack-builder` dependencies :
  ```
  npm run swb:install
  ```

<br/>

## Usage

### Configure `sfraBuilderConfig.js`

- Copy the `webpackHandling/example_sfraBuilderConfig.js` file to the root folder of your project and rename it to `sfraBuilderConfig.js`.
```bash
# Structure 1
$ cp node_modules/sfra-webpack-builder/webpackHandling/example_sfraBuilderConfig.js sfraBuilderConfig.js
# OR
# Structure 2
$ cp sfra-webpack-builder/webpackHandling/example_sfraBuilderConfig.js sfraBuilderConfig.js
```
- In the root `package.json` of the project configure the location to your **`sfraBuilderConfig`** file.
*Example*

`"sfraBuilderConfig": "./sfraBuilderConfig"`

- Configure *cartridges* and *aliases* in `sfraBuilderConfig.js` (based on the location of `sfraBuilderConfig.js`)
**(Ensure that the paths in `sfraBuilderConfig.js` point correctly to the included SFRA and plugins according to your directory structure)** The paths needs to be set relatively to *webpack.config.js*
- Run `npm run swb:npm:install` in the root folder of your project. This will setup all cartridges's node_modules dependencies in the directories which are defined in `sfraBuilderConfig.js` **`cartridges`** array.
- Run `npm run swb:dev` or `npm run swb:prod`. This will compile all related `js/jsx & css` files included in the directories which are defined in `sfraBuilderConfig.js`

<br/>

### Install cartridges dependencies in production mode
This is helpful when you're running npmInstall in a CI/CD environnement and you don't need to install devDependencies for cartridges.
Add ` -- production` to the npmInstall script.
- Structure 1 => `"swb:npm:install": "node ./node_modules/sfra-webpack-builder/installHandling/install.js -- production",`
- Structure 2 => `"swb:npm:install": "node ./sfra-webpack-builder/installHandling/install.js -- production",`

<br/>

### Compile in watch mode
Watch mode will recompile files that have changed without the need to run `npm run swb:dev` over and over. It is very helpful when developing and changing a lot of files.
- Run `npm run swb:watch`. This will compile in dev mode first, and then watch files for changes.

**Livereload**

This tool supports LiveReload via [webpack-livereload-plugin](https://github.com/statianzo/webpack-livereload-plugin) and [Chrome plugin](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei).
- Run `npm run swb:watch:reload`. This will run in watch mode + reload specific browser tabs once compilation is done. Everytime a file is changed, it's recompiled and the browser is reloaded.

<br/>

### Aliases
`module.exports.aliasConfig` let you specify, how to load module packages inside your plugin. Further information can be found in the [WebpackDocumentation](https://webpack.js.org/configuration/resolve/)

```js
module.exports.aliasConfig = {
    // enter all aliases to configure
    base: path.resolve(
        process.cwd(),
        'storefront-reference-architecture/cartridges/app_storefront_base/cartridge/client/default/'
    ),
    CustomPlugin: path.resolve(
        process.cwd(),
        'plugin_wishlists/cartridges/plugin_wishlists/cartridge/client/default/'
    ),
    // Node module alias examples
    '@react': 'preact/compat',
    '@react-dom': 'preact/compat'
}
```
The alias `CustomPlugin` allows to retrieve modules through cartridges by using `require('CustomPlugin/default/js/myFile.js');` or `import Foo from CustomPlugin/default/js/myFile`;

<br/>

### Copying static files

`module.exports.copyConfig` if present, let you specify, which static files you want to copy during the build, for specific cartridge. This feature uses  [CopyWebpackPlugin](https://webpack.js.org/plugins/copy-webpack-plugin/)
The example below is the equivalent of SFRA's `npm run compile:fonts` command.

```js
/**
 * Allows copying files to static folder
 */
 module.exports.copyConfig = {
    './cartridges/app_storefront_base': [
      { from: './node_modules/font-awesome/fonts/', to: 'default/fonts' },
      { from: './node_modules/flag-icon-css/flags', to: 'default/fonts/flags' },
    ],
  };
```

<br/>

### Exclude Js files from build

`module.exports.excludeJs` if present, let you specify, which js files you want to exclude during the build, for specific cartridge.

Additionally the above `module.exports.copyConfig` copy config can be used to copy the client file to static js folder if required.

This will allow us to compile the all of the js files in a cartridge except those which are configured in excludeJs.

```js
/**
 * Allows excluding js files for compile
 */
module.exports.excludeJS = {
  "cartridges/app_custom": [
    "filesToBeExcluded.js",
  ],
};
```

<br/>

### Additional SCSS include paths

`module.exports.copyConfig` if present, let you specify custom include paths that you want to be used in compiling SCSS.

```js
/**
 * Allows custom include path config
 */
module.exports.includeConfig = {
  "./cartridges/app_storefront_base": {
    scss: ["my-custom-node_modules"],
  },
};
```

<br/>

## Testing
Install dependencies
```
npm install
```
This project contains tests which rely on `mocha`.
Please run using `npm run test`

## Acknowledgement
This project was inspired by, and is a heavily modified version of [sfra-webpack-setup](https://github.com/danechitoaie/sfra-webpack-setup)

Thanks to *@danechitoaie* (https://github.com/danechitoaie)

## License

Licensed under the current NDA and licensing agreement in place with your organization. (This is explicitly not open source licensing.)
