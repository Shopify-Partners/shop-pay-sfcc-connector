/* API Includes */
var ABTestMgr = require('dw/campaign/ABTestMgr');

/* Global Variables */
var abTests = ['shoppayAA', 'shoppayAB'];
var segmentTypes = ['Control', 'Treatment'];

/**
 * Helper function to retrieve the active shoppay test segment
 * @param {boolean} shoppayApplicable is shoppay applicable to basket
 * @returns {string} the active shoppay ab test segment
 */
function getAssignmentGroup(shoppayApplicable) {
    var activeSegment = 'excluded';

    if(shoppayApplicable) {
        abTests.forEach(function(abTest) {
            segmentTypes.forEach(function(segmentType) {
                var segment = abTest + segmentType;
                if(ABTestMgr.isParticipant(abTest, segment)) {
                    activeSegment = segmentType.toLowerCase();
                }
            });
        });
    }

    return activeSegment;
}

module.exports = {
    getAssignmentGroup: getAssignmentGroup
}