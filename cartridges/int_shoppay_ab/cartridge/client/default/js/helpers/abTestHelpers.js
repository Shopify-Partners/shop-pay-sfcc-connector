/**
 * Gets the value of a specified cookie
 * @param {string} cName - cookie name
 * @returns {string} - value of a specified cookie
 */
function getCookie(cName) {
    let name = cName + '=';
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

/**
 * Set a Cookie
 * @param {string} cName - cookie name
 * @param {string} cValue - cookie value
 * @param {string} expDays - days until cookie expires
 */
function setCookie(cName, cValue, expDays) {
    let date = new Date();
    date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = cName + "=" + cValue + "; " + expires + ";";
}

/**
 * Gets the shoppayAB test cookie and converts it to a 
 * JSON object
 * @returns {object | undefined} - abCookie json object or undefined
 */
function parseABTestCookie() {
    var abCookie = getCookie('shoppayAB');
    if(abCookie) {
        //atob decodes base64 to ensure the string is parsed correctly
        return JSON.parse(atob(abCookie));
    }

    return;
}

module.exports = {
    getCookie: getCookie,
    setCookie: setCookie,
    parseABTestCookie: parseABTestCookie
};
