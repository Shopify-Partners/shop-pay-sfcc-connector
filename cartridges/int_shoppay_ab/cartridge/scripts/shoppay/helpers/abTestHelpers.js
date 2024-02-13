var ABTestMgr = require('dw/campaign/ABTestMgr');
var abTests = ['shoppayAA', 'shoppayAB'];
var segmanetTypes = ['Control', 'Treatment'];

/**
 * Helper function to retrieve the active shoppay test segment
 * @returns {string | undefined} the active shoppay ab test segment
 */
function getAssignmentGroup() {
    var activeSegment = 'excluded';
    abTests.forEach(function(abTest) {
        segmanetTypes.forEach(function(segmanetType) {
            var segment = abTest + segmanetType;
            if(ABTestMgr.isParticipant(abTest, segment)) {
                activeSegment = segmanetType.toLowerCase();
            }
        });
    });

    return activeSegment;
}

module.exports = {
    getAssignmentGroup: getAssignmentGroup
}