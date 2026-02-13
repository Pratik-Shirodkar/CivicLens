const { Coinbase, Wallet } = require('@coinbase/coinbase-sdk');
require('dotenv').config();
const fs = require('fs');

const apiKeyName = process.env.CDP_API_KEY_NAME;
const privateKey = process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, '\n');

(async () => {
    try {
        console.log('Configuring...');
        Coinbase.configure({ apiKeyName, privateKey });
        console.log('Creating wallet...');
        const wallet = await Wallet.create({ networkId: 'base-sepolia' });
        console.log('SUCCESS');
        fs.writeFileSync('cdp_status.txt', 'SUCCESS: ' + wallet.getId());
    } catch (e) {
        console.error('FAILED');
        fs.writeFileSync('cdp_status.txt', 'FAILED');
        fs.writeFileSync('cdp_error.txt', JSON.stringify({
            message: e.message,
            stack: e.stack,
            response: e.response?.data
        }, null, 2));
    }
})();
