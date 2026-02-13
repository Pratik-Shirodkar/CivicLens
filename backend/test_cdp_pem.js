const { Coinbase, Wallet } = require('@coinbase/coinbase-sdk');
require('dotenv').config();

const apiKeyName = process.env.CDP_API_KEY_NAME;
let privateKey = process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, '');

// If key doesn't have headers, add them
if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    console.log('Adding PEM headers to private key...');
    privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`;
}

(async () => {
    try {
        console.log('Configuring with PEM formatted key...');
        Coinbase.configure({ apiKeyName, privateKey });

        console.log('Attempting Wallet.listWallets()...');
        const wallets = await Wallet.listWallets();
        console.log(`Found ${wallets.data.length} wallets.`);
    } catch (e) {
        console.error('FAILED:', e.message);
        if (e.response) {
            console.error('Response:', e.response.status);
        }
    }
})();
