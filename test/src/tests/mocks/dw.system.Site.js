let mockPreferences = {
    api_key: 'ababababababababab',
};

const preferences = {};

const Site = {
    current: {
        getID() {
            return 'SFRA';
        },
        getCustomPreferenceValue(key) {
            if (Object.prototype.hasOwnProperty.call(mockPreferences, key)) {
                return mockPreferences[key];
            }

            return preferences[key];
        }
    },
    getCurrent() {
        return this.current;
    }
};

const setMockPreferenceValue = (key, value, isEnum) => {
    if (isEnum) {
        mockPreferences[key] = {
            getValue() {
                return value;
            }
        };
    } else {
        mockPreferences[key] = value;
    }
};

const restore = () => {
    mockPreferences = {};
};

module.exports = Site;
module.exports.setMockPreferenceValue = setMockPreferenceValue;
module.exports.restore = restore;

Object.defineProperty(module.exports, 'preferences', {
    get: () => Object.assign({}, preferences, mockPreferences)
});
