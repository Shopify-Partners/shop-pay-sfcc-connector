/* eslint-disable no-undef */
const cartridgeFinder = require('./lib/_cartridgeFinder');

let program = require('commander');
program.version('1.0.0');

program
    .command('code:zip')
    .option('-r, --release <release-name>', 'Describes the name of the code deployment from to generate an archive. This name shows in Business Manager Code Deployments')
    .description('Prepares and zips all cartridges into a single release zip for deployment.')
    .action((options) => {
        cartridgeFinder(options.release);
    });

program.parse(process.argv);
