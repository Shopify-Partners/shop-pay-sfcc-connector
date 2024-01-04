/**
 * @function timestamp
 * @description Returns a YMDmS formatted timestamp.
 *
 */
function timestamp() {
    let date_obj = new Date(),
        minutes = date_obj.getMinutes(),
        date = ("0" + date_obj.getDate()).slice(-2),
        month = ("0" + (date_obj.getMonth() + 1)).slice(-2),
        year = date_obj.getFullYear(),
        ts = `${year}${month}${date}${minutes}`;
    return ts;
}

/**
 * @function hostname
 * @description Returns part of hostname from dw.json or a generic name for a build.
 *
 */
function hostname() {
    try {
        const dwJSON = require("../../dw.json");
        if (dwJSON) {
            hostname = dwJSON.hostname.split(".")[0];
            return hostname;
        }
    } catch (err) {
        return timestamp();
    }
}

function gitHash() {
    const revision = require("child_process").execSync("git rev-parse HEAD").toString().slice(0, 7);
    return revision;
}

module.exports = {
    timestamp,
    hostname,
    gitHash,
};
