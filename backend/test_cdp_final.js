const { Coinbase, Wallet } = require('@coinbase/coinbase-sdk');
require('dotenv').config();

const apiKeyName = process.env.CDP_API_KEY_NAME;
const privateKey = process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, '\n');

console.log('--- FINAL DIAGNOSTIC ---');

try {
    Coinbase.configure({ apiKeyName, privateKey });
    console.log('Coinbase configured');

    (async () => {
        try {
            console.log('Attempting Wallet.create...');
            // Try different network IDs just in case
            const wallet = await Wallet.create({ networkId: 'base-sepolia' });
            console.log('SUCCESS: Wallet created');
            console.log('Address:', (await wallet.getDefaultAddress()).getId());
        } catch (err) {
            console.log('ERROR TYPE:', err.constructor.name);
            console.log('ERROR MESSAGE:', err.message);
            if (err.stack) console.log('STACK:', err.stack);
            if (err.response) {
                console.log('REMOTE STATUS:', err.response.status);
                console.log('REMOTE DATA:', JSON.stringify(err.response.data, null, 2));
            }
        }
    })();
} catch (e) {
    console.log('CONFIG ERROR:', e.message);
}
