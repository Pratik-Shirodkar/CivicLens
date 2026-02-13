const { Coinbase, Wallet } = require('@coinbase/coinbase-sdk');
require('dotenv').config();

const apiKeyName = process.env.CDP_API_KEY_NAME;
let privateKey = process.env.CDP_API_KEY_PRIVATE_KEY;
if (privateKey && privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
}

(async () => {
    try {
        Coinbase.configure({ apiKeyName, privateKey });

        console.log('Attempting list with limit=1...');
        const wallets = await Wallet.listWallets({ limit: 1 });
        console.log(`Found ${wallets.data.length} wallets.`);
    } catch (e) {
        console.error('FAILED:', e.message);
        if (e.response) {
            console.error('Status:', e.response.status);
            console.error('Data:', JSON.stringify(e.response.data));
        }
    }
})();
