const sinon = require('sinon');

const Service = {

    call: sinon.stub(),
    createRequest: sinon.stub(),
    parseResponse: sinon.stub(),
    getRequestLogMessage: sinon.stub(),
    getResponseLogMessage: sinon.stub(),

    createService(svc) {
        return {
            svc,
            call: this.call.returns({
                status: 'OK'
            }),
            createRequest: this.createRequest
        };
    }
};

module.exports = Service;
