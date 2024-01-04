/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable security/detect-child-process */
/* eslint-disable no-console */
const prepareCartridges = require("./_prepareCartridges");
const fs = require("fs-extra");
const path = require("path");
const parseString = require("xml2js").parseString;
const walk = require("walk");
const chalk = require("chalk");
const exec = require("child_process").exec;
const log = console.log;

/**
 * @function cartridgeFinder
 * @description Find all cartridges.
 *
 * @param [releaseName] {String} Optional release name (for CI builds)
 */
function cartridgeFinder(releaseName) {
    log(chalk.magenta.bold(" 🚮 Bundling Code 🚮\n"));

    log(" -----------------------------------");
    log(" Finding Cartridges");
    log(" -----------------------------------");
    log("");

    // Begin time tracker
    const startTime = new Date();

    const cartridgePaths = [];
    // eslint-disable-next-line no-undef
    const srcDir = process.cwd();
    const options = {
        followLinks: false,
        filters: ["node_modules", "bin", "dist", "errorpages", "maintenance_pages", "test"],
    };
    const walker = walk.walk(srcDir, options);

    // Remove destination of collected cartridges (for code:build)
    exec("rm -r ./dist", function (err) {
        if (err) {
            return err;
        }
    });

    walker.on("file", (root, stat, next) => {
        if (stat.name === ".project") {
            const pathname = `${root}/${stat.name}`;
            fs.readFile(pathname, (err, data) => {
                parseString(data, { trim: true }, (err, result) => {
                    if (err) {
                        return err;
                    }
                    // Extracting cartridge name in a non-elegant way for now
                    // eslint-disable-next-line one-var
                    const cartridge = result.projectDescription.name[0];
                    // eslint-disable-next-line one-var
                    const cartridgeDirs = path.join(pathname, "../..", cartridge);
                    cartridgePaths.push(cartridgeDirs);
                });
                if (err) {
                    return err;
                }
            });
        }
        next();
    });

    walker.on("end", () => {
        prepareCartridges(releaseName, cartridgePaths, (start = startTime));
    });
}

module.exports = cartridgeFinder;
