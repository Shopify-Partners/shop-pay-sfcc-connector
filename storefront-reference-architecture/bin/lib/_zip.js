const fs = require('fs-extra')
const archiver = require('archiver')

/**
 * Zip class handling file operations
 */
let zip = function(outputFilename, done) {
    let volumeIndex = 0,
        archive,
        /** @type {String} */
        currentVolume,
        /** @type {WriteStream} */
        currentStream

    /**
     * Add a file to an archive
     *
     * @param {String} file Source file that is added to the zip archive
     * @param {String} targetPath Target zip file name
     * @return {Promise} Promise for this operation
     */
    this.addFile = function addFile(sourceFile, targetPath) {
        return new Promise(function(resolve) {
            archive.removeAllListeners('entry')
            archive.on('entry', function() {
                resolve(archive.pointer())
            })

            archive.file(sourceFile, { name: targetPath })
        })
    }

    /**
     * Initialize streams for a new ZIP chunk
     * @param {Number} index Chunk index
     */
    this.initializeZipFile = function initializeZipFile(index) {
        archive = archiver('zip')

        let postfix = getFilenamePostfix(index)
        currentVolume = outputFilename + postfix + '.zip'

        currentStream = fs.createWriteStream(currentVolume)
        currentStream.on('close', function() {
            done()
        })

        archive.pipe(currentStream)
    }

    /**
     * Close current chunk and create a new one
     */
    this.createNewVolume = function createNewVolume() {
        // We only want to listen to the close event of the last chunk
        currentStream.removeAllListeners('close')

        archive.removeAllListeners('finish')
        archive.finalize()
        this.initializeZipFile(++volumeIndex)
    }

    /**
     * Close current chunk
     */
    this.close = function close() {
        archive.finalize()
    }

    /**
     * Returns the filename of the current volume
     *
     * @return {String}
     */
    this.getVolumeName = function getVolumeName() {
        return currentVolume
    }

    return this.initializeZipFile(volumeIndex)
}


/**
 * Creates a three digit postfix for the zip filename (e.g. "_001")
 */
function getFilenamePostfix(index) {
    let postfix = ''

    // Assemble the filename postfix for multiple volumes
    if (index > 0) {
        postfix = '_'

        if (index < 10) {
            postfix += '00'
        } else if (index < 100) {
            postfix += '0'
        }

        postfix += index
    }

    return postfix
}

module.exports = zip
