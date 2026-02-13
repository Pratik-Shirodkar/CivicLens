const { Coinbase, Wallet } = require('@coinbase/coinbase-sdk');
require('dotenv').config();
const fs = require('fs');

const apiKeyName = process.env.CDP_API_KEY_NAME;
const privateKey = process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, '\n');

(async () => {
    try {
        console.log('Configuring...');
        Coinbase.configure({ apiKeyName, privateKey });

        console.log('Attempting to list wallets...');
        // Try Wallet.list() - this is a guess based on common SDK patterns
        // If it fails, we'll catch it.
        try {
            const wallets = await Wallet.list();
            console.log(`Found ${wallets.data.length} wallets.`);
            if (wallets.data.length > 0) {
                console.log('First wallet ID:', wallets.data[0].getId());
                fs.writeFileSync('cdp_wallet_found.txt', JSON.stringify(wallets.data[0]));
            } else {
                console.log('No wallets found.');
            }
        } catch (e) {
            console.error('Wallet.list() failed or not supported:', e.message);
            // Verify if we can just create a wallet without funding/hydrating?
            // Maybe Wallet.create({ networkId: 'base-sepolia', useFaucet: false })?
            // But the error was ResourceExhausted, which usually means faucet.
        }

    } catch (e) {
        console.error('CRITICAL:', e.message);
    }
})();
