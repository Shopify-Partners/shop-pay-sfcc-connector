var ABTestMgr = require('dw/campaign/ABTestMgr');
var Cookie = require('dw/web/Cookie');
var StringUtils = require('dw/util/StringUtils');
var abTests = ['shoppayAA', 'shoppayAB'];
var segmentTypes = ['Control', 'Treatment'];

/**
 * Helper function to retrieve the active shoppay test segment
 * @param {boolean} shoppayApplicable is shoppay applicable to basket
 * @returns {object} the active ab test and shoppay ab test segment
 */
function getAssignmentGroup(shoppayApplicable) {
    var activeSegment = 'excluded';
    var activeABTest = null;

    if(shoppayApplicable) {
        abTests.forEach(function(abTest) {
            segmentTypes.forEach(function(segmentType) {
                var segment = abTest + segmentType;
                if(ABTestMgr.isParticipant(abTest, segment)) {
                    activeABTest = abTest;
                    activeSegment = segmentType.toLowerCase();
                }
            });
        });
    }

    return {abTest: activeABTest, assignmentGroup: activeSegment};
}

/**
 * Creates a cookie
 * @param {sring} cname cookie name
 * @param {sring} cvalue cookie value
 */
function createCookie(cname, cvalue) {
    var cookie = new Cookie(
        cname,
        //the string is encoded to base64 to ensure the cookie JSON string keeps
        // the correct struture
        encodeObject(cvalue)
    );
    //set cookie to expire in 90 days
    cookie.setMaxAge(7776000);
    response.addHttpCookie(cookie);
}

/**
 * Creates the shoppayAB cookie
 * @param {boolean} shoppayABCookieValue value of the cookie to be set
 * @param {int | undefined} shoppayABCookieValue value of the cookie to be set
 */
function createShopPayABCookie(shoppayABCookieValue) {
    createCookie('shoppayAB',
        shoppayABCookieValue
    );
}

/**
 * encodes and stringifys object
 * @param {object} obj the json object
 * @returns {string} the encoded json string
 */
function encodeObject(obj) {
    return StringUtils.encodeBase64(
        JSON.stringify(obj)
    );
}

/**
 * decode and parse base 64 json string
 * @param {string} str json string to be parsed and decoded
 * @returns {object} the json object
 */
function decodeString(str) {
    return JSON.parse(
        StringUtils.decodeBase64(str)
    );
}


module.exports = {
    getAssignmentGroup: getAssignmentGroup,
    createShopPayABCookie: createShopPayABCookie,
    encodeObject: encodeObject,
    decodeString: decodeString
}