/**
 * Gets the value of a specified cookie
 * @param {string} cname - cookie name
 * @returns {string} - value of a specified cookie
 */
function getCookie(cname) {
    let name = cname + '=';
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
 * @param {string} cname - cookie name
 * @param {string} cvalue - cookie value
 * @param {string} expDays - days until cookie expires
 */
function setCookie(cname, cvalue, expDays) {
    let date = new Date();
    date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + date.toUTCString();
    document.cookie = cname + '=' + cvalue + '; ' + expires + '; path=/';
}

function deleteCookieValue(cookieName) {
    var d = new Date();
    d.setTime(d.getTime());
    var cookieExpireDate = 'expires=' + d.toString();
    document.cookie = cookieName + '=expired;' + cookieExpireDate;
}

/**
 * Gets the shoppayAB test cookie and converts it to a 
 * JSON object
 * @returns {object | undefined} - abCookie json object or undefined
 */
function parseABTestCookie() {
    var abCookie = getCookie('shoppayAB');
    if(abCookie) {
        return JSON.parse(abCookie);
    }

    return;
}

module.exports = {
    getCookie: getCookie,
    setCookie: setCookie,
    deleteCookieValue: deleteCookieValue,
    parseABTestCookie: parseABTestCookie
};
