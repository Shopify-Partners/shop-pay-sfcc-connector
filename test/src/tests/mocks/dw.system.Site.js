let mockPreferences = {
    shoppayStoreName: 'The Best Store Ever',
    shoppayStorefrontAPIVersion: '2.0',
    shoppayStorefrontAPIToken: 'asdf',
    shoppayCartButtonEnabled: true,
    shoppayStoreId: 'qwerty',
    shoppayClientId: '999',
    shoppayAdminAPIVersion: 'v1',
    shoppayStorefrontAPIVersion: 'v2',
    shoppayModalImageViewType: 'small',
    shoppayPDPButtonEnabled: true,
    shoppayModalDebugEnabled: false
}

const preferences = {}

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
        },
        getDefaultLocale() {
            return 'en-US'
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
