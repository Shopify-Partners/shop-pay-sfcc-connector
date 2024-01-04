const sfraBuilderConfig = require("./sfraBuilderConfig");
const npmInstallHelper = require("./installHelper");

(() => {
    sfraBuilderConfig.cartridges.forEach((cartridge) => {
        npmInstallHelper.npmInstall(cartridge);
    });
})();
