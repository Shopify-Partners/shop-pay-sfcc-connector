const path = require('path');
const sfraBuilderConfig = require('./sfraBuilderConfig');
const WebpackExtractTextPlugin = require('extract-text-webpack-plugin');

/**
 * Add task runners and plugins to ruleSet
 * @param {string} executingDir - DirName from which this script is originally executed to be the same as node_modules
 * @param {string} cartridge - Cartridge to compile
 * @param {boolean} env - Determine the mode of bundling
 * @param {string} fileType - File to add rulesets for
 * @returns {array} Rulesets for frontend compilation
 */
function buildRuleSet(executingDir, cartridge, env, fileType) {
    const sourcePath = path.resolve(executingDir, cartridge, 'cartridge/client');
    const ruleSet = [];
    if (fileType === 'js') {
        if (env.useLinter) {
            ruleSet.push({
                test: /\.js$/,
                include: sourcePath,
                exclude: /node_modules/,
                use: ['eslint-loader'],
                enforce: 'pre',
            });
        }
        ruleSet.push({
            test: /bootstrap(.)*\.js$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/env'],
                    plugins: ['@babel/plugin-proposal-object-rest-spread'],
                    cacheDirectory: true,
                },
            },
        });
    } else if (fileType === 'jsx') {
        if (env.useLinter) {
            ruleSet.push({
                test: /\.jsx$/,
                include: sourcePath,
                exclude: /node_modules/,
                use: ['eslint-loader'],
                enforce: 'pre',
            });
        }
        ruleSet.push({
            test: /\.jsx$/,
            loader: 'babel-loader',
            options: {
                cacheDirectory: true,
                presets: ['react'],
            },
        });
    }  else {
        // include all node_modules folder from each cartridge
        // this allows to reuse node_modules folder from other cartridges without the need
        // to directly install them in each cartridge
        let scssIncludePath = [];
        sfraBuilderConfig.cartridges.map(includeCartridges => {
            scssIncludePath.push(path.resolve(includeCartridges.split('cartridges')[0], 'node_modules'));
            scssIncludePath.push(path.resolve(includeCartridges.split('cartridges')[0], 'node_modules/flag-icon-css/sass'));
        });
        scssIncludePath.push(path.resolve(executingDir, 'node_modules'));
        scssIncludePath.push(path.resolve(executingDir, 'node_modules/flag-icon-css/sass'));
        ruleSet.push({
            test: /\.scss$/,
            loader: WebpackExtractTextPlugin.extract([
                {
                    loader: 'css-loader',
                    options: {
                        url: false,
                        sourceMap: (env.dev === true),
                        minimize: (env.dev === false),
                    },
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        plugins: () => [require('autoprefixer')],
                    },
                },
                {
                    loader: 'sass-loader',
                    options: {
                        includePaths: scssIncludePath,
                        sourceMap: (env.dev === true),
                        minimize: (env.dev === false),
                    },
                },
            ]),
        });
    }
    return ruleSet;
}

module.exports = {
    buildRuleSet
};
