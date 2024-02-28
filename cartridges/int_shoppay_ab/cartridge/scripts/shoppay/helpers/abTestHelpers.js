var ABTestMgr = require('dw/campaign/ABTestMgr');
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

module.exports = {
    getAssignmentGroup: getAssignmentGroup
}