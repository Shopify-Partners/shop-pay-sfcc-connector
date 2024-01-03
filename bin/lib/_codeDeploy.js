/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable no-console */
const sfcc = require('sfcc-ci')
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const exec = require('child_process').exec
const log = console.log

/**
 * @function codeDeploy
 * @description Deploys code build zip from /dist dir to instance specified in dw.json or ENV VAR.
 *
 */
function codeDeploy() {
    let dwJsonContents
    const dwJsonFile = path.join(__dirname, '../../dw.json')
    dwJsonContents = fs.readFileSync(dwJsonFile, { encoding: 'utf8' })
    dwJsonContents = JSON.parse(dwJsonContents)

    const client_id = dwJsonContents['client-id']
    const client_secret = dwJsonContents['client-secret']
    const hostname = dwJsonContents.hostname
    const code_dir = fs.readdirSync(path.resolve('./dist/'))
    const options = {}

    log(' -----------------------------------')
    log(' Deploying Code')
    log(' -----------------------------------')
    log('')

    sfcc.auth.auth(client_id, client_secret, (err, token) => {
        const code_version = path.resolve(__dirname, '../../dist/', `${code_dir[0]}.zip`)
        if (token) {
            sfcc.code.deploy(hostname, code_version, token, options, (err, res) => {
                if (err) {
                    log(chalk.red.bold(`${err}\n`))
                } else {
                    log(chalk.yellow.bold(' Successfully deployed code version:\n'))
                    log(chalk.cyan.bold(`    ${res}`))
                    sfcc.code.list(hostname, token, (err, res) => {
                        if (err) {
                            log(`${err}`)
                        } else {
                            const parsed_version = path.parse(code_version.split('/').slice(-1)[0]).name
                            res.data.forEach(elem => {
                                if (elem.id === parsed_version) {
                                    _codeActivate(hostname, parsed_version, token)
                                }
                            })
                        }
                    })
                }
            })
        }
        if (err) {
            log(`Authentication error: ${err}`)
        }
    })

    /**
    * @function _codeActivate
    * @description Activate latest build.
    *
    * @param [hostname] {String} Target SFCC Instance
    * @param [code_version] {String} ID of deployed code
    * @param [token] {String} Oauth token to use for authentication
    */
    function _codeActivate(hostname, code_version, token) {
        const distDir = './dist';

        log('')
        log(' -----------------------------------')
        log(' Activating Code')
        log(' -----------------------------------')
        log('')

        sfcc.code.activate(hostname, code_version, token, (err) => {
            if (err) {
                log(`${err}`)
            } else {
                log(chalk.yellow.bold(' Successfully activated code version:\n'))
                log(chalk.cyan.bold(`    ${code_version}`))
                log(chalk.cyan.bold(`    ${hostname}\n`))
            }

        })
        // Remove destination of collected cartridges for Prophet debugger
        exec('rm -r ./dist', function(err) {
            if (err) {
                return err
            }
        })
    }
}

module.exports = codeDeploy
