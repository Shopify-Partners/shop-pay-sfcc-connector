// const zipStorefrontData = require('./lib/_zipStorefrontData')
const cartridgeFinder = require("./lib/_cartridgeFinder");
const codeDeploy = require("./lib/_codeDeploy");
const timestamp = require("./lib/_buildName").timestamp();

let program = require("commander");
program.version("0.5.0");

program
    .command("code:zip")
    .option(
        "-r, --release <release-name>",
        "Describes the name of the code deployment from to generate an archive. This name shows in Business Manager Code Deployments",
        `localBuild-${timestamp}`,
    )
    .description("Prepares and zips all cartridges into a single release zip for deployment.")
    .action((options) => {
        cartridgeFinder(options.release);
    });

// program
//     .command('data:zip')
//     .option('-r, --release <release-name>', 'String to put at the end of generated site import archive.')
//     .description('Attempts to zip the specified directory -- representing a storefront data-import.')
//     .action((options) => {
//         zipStorefrontData(options.release)
//
//     })

program
    .command("code:deploy")
    .option("-c", "--code <code-version>", "dist/*")
    .action((options) => {
        codeDeploy(options);
    });

program.parse(process.argv);
