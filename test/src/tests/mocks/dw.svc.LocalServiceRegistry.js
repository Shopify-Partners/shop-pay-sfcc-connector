const LocalServiceRegistry = {
    createService(serviceName, callback) {
        return {
            serviceName,
            createRequest: callback.createRequest,
            parseResponse: callback.parseResponse,
            getRequestLogMessage: callback.getRequestLogMessage,
            getResponseLogMessage: callback.getResponseLogMessage,
            mockCall: callback.mockCall,
        }
    }
}

module.exports = LocalServiceRegistry
