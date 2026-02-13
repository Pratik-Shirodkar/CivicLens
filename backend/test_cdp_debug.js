const { CDPWallet } = require('./wallet');
require('dotenv').config();

(async () => {
    console.log("Testing CDP Wallet Init...");
    const w = new CDPWallet();
    try {
        const success = await w.init();
        if (success) {
            console.log('SUCCESS: CDP Wallet initialized');
            console.log('Address:', await w.getAddress());
        } else {
            console.log('FAILURE: Init returned false (check previous logs)');
        }
    } catch (e) {
        console.log('CRITICAL FAILURE:', e);
    }
})();
