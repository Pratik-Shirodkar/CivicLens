const { Coinbase, Wallet } = require('@coinbase/coinbase-sdk');
require('dotenv').config();
const fs = require('fs');

const apiKeyName = process.env.CDP_API_KEY_NAME;
const privateKey = process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, '\n');

(async () => {
    try {
        console.log('Configuring...');
        Coinbase.configure({ apiKeyName, privateKey });
        console.log('Listing wallets...');
        // SDK might not have a direct listAll, but let's try some discovery
        // Actually, let's just try to get the server time or something simple to test the key
        // But the SDK doesn't have a simple ping. Let's try to fetch a dummy wallet.
        try {
            await Wallet.fetch('dummy');
        } catch (e) {
            console.log('API FETCH TEST STATUS:', e.response?.status || 'No Response');
            fs.writeFileSync('cdp_test_detailed.txt', JSON.stringify({
                status: e.response?.status,
                data: e.response?.data,
                message: e.message
            }, null, 2));
        }
    } catch (e) {
        console.error('CRITICAL:', e.message);
    }
})();
