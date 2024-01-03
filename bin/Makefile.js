'use strict';

/* global cat, cd, cp, echo, exec, exit, find, ls, mkdir, pwd, rm, target, test */

require('shelljs/make');

var chalk = require('chalk'),
    path = require('path'),
    spawn = require('child_process').spawn,
    fs = require('fs'),
    shell = require('shelljs');

function getSandboxUrl() {
    if (test('-f', path.join(process.cwd(), 'dw.json'))) {
        var config = cat(path.join(process.cwd(), 'dw.json'));
        var parsedConfig = JSON.parse(config);
        return '' + parsedConfig.hostname;
    }
    return '';
}

function getOptions(defaults, args) {
    var params = {};
    var i = 0;
    while (i < args.length) {
        var item = args[i];
        if (item.indexOf('--') === 0) {
            if (i + 1 < args.length && args[i + 1].indexOf('--') < 0) {
                var value = args[i + 1];
                value = value.replace(/\/+$/, "");
                params[item.substr(2)] = value;
                i += 2;
            } else {
                params[item.substr(2)] = true;
                i++;
            }
        } else {
            params[item] = true;
            i++;
        }
    }
    var options = Object.assign({}, defaults, params);
    return options;
}

function getOptionsString(options) {
    if (!options.baseUrl) {
        console.error(chalk.red('Could not find baseUrl parameter.'));
        process.exit();
    }

    var optionsString = '';

    Object.keys(options).forEach(function (key) {
        if (options[key] === true) {
            optionsString += key + ' ';
        } else {
            optionsString += '--' + key + ' ' + options[key] + ' ';
        }
    });

    return optionsString;
}

target.compileFonts = function () {
    var fontsDir = 'cartridges/app_storefront_base/cartridge/static/default/fonts';
    mkdir('-p', fontsDir);
    cp('-r', 'node_modules/font-awesome/fonts/', 'cartridges/app_storefront_base/cartridge/static/default');
    cp('-r', 'node_modules/flag-icon-css/flags', fontsDir + '/flags');
};

target.functional = function (args) {
    var defaults = {
        baseUrl: 'https://' + getSandboxUrl() + '/s/RefArch',
        client: 'chrome'
    };

    var configFile = 'test/functional/webdriver/wdio.conf.js';
    if(args.indexOf('appium') > -1) {
        args.splice(args.indexOf('appium'), 1);
        configFile = 'test/functional/webdriver/wdio.appium.js';
        defaults = {
            baseUrl: 'https://' + getSandboxUrl() + '/s/RefArch'
        }
    }

    var options = getOptions(defaults, args);
    var optionsString = getOptionsString(options);

    console.log(chalk.green('Installing selenium'));
    exec('node_modules/.bin/selenium-standalone install', { silent: true });

    console.log(chalk.green('Selenium Server started'));
    var selenium = exec('node_modules/.bin/selenium-standalone start', { async: true, silent: true });

    console.log(chalk.green('Running functional tests'));

    var tests = spawn('./node_modules/.bin/wdio  ' + configFile + ' ' + optionsString, { stdio: 'inherit', shell: true });

    tests.on('exit', function (code) {
        selenium.kill();
        console.log(chalk.green('Stopping Selenium Server'));
        process.exit(code);
    });
};

target.release = function (args) {
    if (!args) {
        console.log('No version type provided. Please specify release type patch/minor/major');
        return;
    }
    var type = args[0].replace(/"/g, '');
    if (['patch', 'minor', 'major'].indexOf(type) >= 0) {
        console.log('Updating package.json version with ' + args[0] + ' release.');
        var version = spawn('npm version ' + args[0], { stdio: 'inherit', shell: true });
        var propertiesFileName = path.resolve('./cartridges/app_storefront_base/cartridge/templates/resources/version.properties')

        version.on('exit', function (code) {
           if (code === 0) {
               var versionNumber = JSON.parse(fs.readFileSync('./package.json').toString()).version;
               //modify version.properties file
               var propertiesFile = fs.readFileSync(propertiesFileName).toString();
               var propertiesLines = propertiesFile.split('\n');
               var newLines = propertiesLines.map(function (line) {
                   if (line.indexOf('global.version.number=') === 0) {
                       line = 'global.version.number=' + versionNumber;
                   }
                   return line;
               });
               fs.writeFileSync(propertiesFileName, newLines.join('\n'));
               shell.exec('git add -A');
               shell.exec('git commit -m "Release ' + versionNumber + '"');
               console.log('Version updated to ' + versionNumber);
               console.log('Please do not forget to push your changes to the integration branch');
           }
        });
    } else {
        console.log('Could not release new version. Please specify version type (patch/minor/major).');
    }
}
