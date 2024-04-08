/* eslint-disable no-undef */
const archiver = require('archiver');
const fs = require('fs-extra');
const chalk = require('chalk');
const exec = require('child_process').exec;
const log = console.log;

/**
 * @function zipCartridges
 * @description Attempts to zip all cartridges into a single release bundle.
 *
 * @param [releaseName] {String} Represents the optional name of a release to process
 */
const zipCartridges = (releaseName, start) => {

    exec('mkdir ./dist', (err) => {
        if (err) {
            return err;
        }
    });

    log('');
    log(' -----------------------------------');
    log(' Zipping Cartridges Folder');
    log(' -----------------------------------');
    log('');

    // Make release path and filenames
    const basePath = `./dist/${releaseName}`;
    const zipPath = `./dist/${releaseName}.zip`;

    let output = fs.createWriteStream(zipPath);
    let archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        // End time tracking
        const stop = new Date();
        log(chalk.magenta.bold(' 📦 Build Complete 📦\n'));
        log(` Bundling took ${(stop - start)/1000} seconds!\n`);
    });

    archive.pipe(output);
    archive.directory(basePath, '');

    log(chalk.yellow.bold(` -- archiving ${basePath}`));
    log(chalk.yellow.bold(` -- writing file to ${zipPath}\n`));

    archive.finalize();

};

module.exports = zipCartridges;
