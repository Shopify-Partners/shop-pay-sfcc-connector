const fs = require('fs');

function createDWJson() {
    try {
        const auth = require('../../dw.json')
        return auth
    } catch (e) {
        const config = {
            'client-id': process.env.SFCC_OAUTH_CLIENT_ID || undefined,
            'client-secret': process.env.SFCC_OAUTH_CLIENT_SECRET || undefined,
            'hostname': process.env.HOSTNAME || undefined,
        }
        content = JSON.stringify(config, null, 2)
        fs.writeFileSync('dw.json', content)
    }
}

createDWJson()