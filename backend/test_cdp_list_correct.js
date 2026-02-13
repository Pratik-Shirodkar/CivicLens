const { Coinbase, Wallet } = require('@coinbase/coinbase-sdk');
require('dotenv').config();
const fs = require('fs');

const apiKeyName = process.env.CDP_API_KEY_NAME;
let privateKey = process.env.CDP_API_KEY_PRIVATE_KEY;

// Fix newlines
if (privateKey && privateKey.includes('\\n')) {
    privateKey = process.env.CDP_API_KEY_PRIVATE_KEY.replace(/\\n/g, '\n');
}

(async () => {
    try {
        console.log('Configuring...');
        Coinbase.configure({ apiKeyName, privateKey });

        console.log('Attempting to list wallets with Wallet.listWallets()...');
        try {
            const wallets = await Wallet.listWallets();
            console.log(`Found ${wallets.data.length} wallets.`);
            fs.writeFileSync('cdp_list_success.txt', JSON.stringify(wallets));
        } catch (e) {
            console.error('Wallet.listWallets() failed:', e.message);
            fs.writeFileSync('cdp_list_error.json', JSON.stringify({
                message: e.message,
                status: e.response?.status,
                data: e.response?.data,
                stack: e.stack
            }, null, 2));
        }

    } catch (e) {
        console.error('CRITICAL:', e.message);
    }
})();
