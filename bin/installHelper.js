/* eslint-disable no-console */
/* eslint-disable max-len */
const path = require("path");
const childProcess = require("child_process");
const klaw = require("klaw");
const through2 = require("through2");

const npmInstall = (dir) => {
    const dirFilter = (item) => {
        const basename = path.basename(item);
        return basename !== ".git" && basename !== "node_modules";
    };

    const fileFilter = through2.obj(function (item, enc, next) {
        const today = new Date();
        const timeSince = today.setHours(today.getHours() - 24);

        if (
            !item.stats.isDirectory() &&
            item.stats.isFile() &&
            path.basename(item.path) === "package.json" &&
            timeSince > item.stats.mtime.getTime()
        )
            this.push(item);
        next();
    });

    const items = [];
    klaw(dir, { filter: dirFilter })
        .pipe(fileFilter)
        .on("data", (item) => items.push(item.path))
        .on("end", () =>
            childProcess.execSync("npm install", {
                cwd: dir,
                input: items[0],
                stdio: "inherit",
                windowsHide: true,
            }),
        );
};

module.exports = {
    npmInstall,
};
