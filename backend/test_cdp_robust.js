const { Coinbase, Wallet } = require('@coinbase/coinbase-sdk');
require('dotenv').config();
const fs = require('fs');

const apiKeyName = process.env.CDP_API_KEY_NAME;
let privateKey = process.env.CDP_API_KEY_PRIVATE_KEY;

// Fix newlines
if (privateKey && privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
}

console.log('--- FINAL DIAGNOSTIC ---');

(async () => {
    try {
        Coinbase.configure({ apiKeyName, privateKey });
        console.log('Coinbase configured');

        console.log('Attempting Wallet.create...');
        const wallet = await Wallet.create({ networkId: 'base-sepolia' });
        console.log('SUCCESS: Wallet created');
        console.log('Address:', (await wallet.getDefaultAddress()).getId());
        fs.writeFileSync('cdp_success.txt', wallet.getId());
    } catch (err) {
        console.log('ERROR:', err.message);
        fs.writeFileSync('cdp_creation_error.json', JSON.stringify({
            message: err.message,
            stack: err.stack,
            response: err.response?.data,
            status: err.response?.status
        }, null, 2));
    }
})();
