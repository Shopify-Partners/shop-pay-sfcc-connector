/* eslint-disable no-undef */
const zipCartridges = require('./_zipCartridges');
const fs = require('fs-extra');
const chalk = require('chalk');
const log = console.log;

/**
 * @function prepareCartridges
 * @description Attempts to collect all cartridges into a single release folder.
 *
 * @param [releaseName] {String} Represents the optional name of a release to process
 */
const prepareCartridges = (releaseName, cartridges, start) => {
    const cartridgePaths = cartridges;
    const distDir = './dist';
    const codeVersionDir = `${distDir}/${releaseName}/${releaseName}`;

    log(' -----------------------------------');
    log(' Preparing Cartridges');
    log(' -----------------------------------');
    log('');

    log(chalk.yellow.bold(` -- code deployment name: ${releaseName}\n`));
    log(chalk.yellow.bold(' -- cartridges found:\n'));
    log(cartridgePaths);
    log('');

    log(chalk.yellow.bold(` -- code version directory: ${distDir}/${releaseName}\n`));

    // Validate and create dist folder
    fs.ensureDirSync(distDir);

    // Create or empty code deployment directory
    fs.emptyDirSync(codeVersionDir);

    // Copy all cartridges into /dist/<build> folder
    cartridgePaths.forEach(cartridge => {
        let cartridgeFolderName = cartridge.split('/');
        // eslint-disable-next-line one-var
        let cartridgeName = cartridgeFolderName[cartridgeFolderName.length - 1];
        // eslint-disable-next-line one-var
        let destinationFolder = `${codeVersionDir}/${cartridgeName}`;
        fs.copySync(cartridge, destinationFolder);
        log(chalk.green.bold(` -- copied ${cartridgeName}`));
    });

    zipCartridges(releaseName, start);
};

module.exports = prepareCartridges;
