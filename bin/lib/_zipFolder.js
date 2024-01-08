/* eslint-disable no-console */
const fs = require('fs-extra')
const zipFolder = require('zip-folder')

/**
 * @function zipCartridges
 * @description Attempts to zip all cartridges into a single release bundle.
 *
 * @param [releaseName] {String} Represents the optional name of a release to process
 */
function zipCartridges(releaseName) {
    console.log('-----------------------------------')
    console.log(' Zipping Cartridges Folder');
    console.log('-----------------------------------')

    // make release path and filenames
    var basePath = './dist/' + releaseName;
    var zipPath = './dist/' + releaseName + '.zip'

    // @TODO check if folder exists and throw an error if it doesn't

    // Debugging: Output the details of the archive process
    console.log(` -- archiving ${basePath}`);
    console.log(` -- writing file to ${zipPath}`)

    // zip all cartridges
    zipFolder(basePath, zipPath, (zipError) => {
        if (zipError !== undefined) { throw zipError; }

        console.log(` -- file written to ${zipPath}`)
    })
}

module.exports = zipCartridges
