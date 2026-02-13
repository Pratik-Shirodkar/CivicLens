/**
 * Verification Script: Real BITE v2 Sandbox Integration
 * 
 * Tests the full flow:
 * 1. Connects to BITE V2 Sandbox 2
 * 2. Checks committee status
 * 3. Encrypts a bounty intent
 * 4. Submits encrypted tx to the chain
 * 5. Waits for block finality
 * 6. Verifies decryption
 */

require('dotenv').config();
const { BiteService } = require('./bite_service.js');

const fs = require('fs');

// Capture all console output to verify_log.txt
const logStream = fs.createWriteStream('verify_log.txt', { flags: 'a' });
const originalLog = console.log;
const originalError = console.error;

function logToFile(type, args) {
    const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    logStream.write(`[${type}] ${msg}\n`);
}

console.log = (...args) => {
    originalLog.apply(console, args);
    logToFile('INFO', args);
};

console.error = (...args) => {
    originalError.apply(console, args);
    logToFile('ERROR', args);
};

async function verifyBiteIntegration() {
    console.log("🔍 Starting BITE v2 Sandbox Verification...");

    // 1. Initialize Service
    const biteService = new BiteService();
    const connected = await biteService.init();

    if (!connected) {
        process.exit(1);
    }
    console.log("✅ Service Initialized");

    // 2. Check Chain Status
    try {
        const info = await biteService.getCommitteeInfo();
        console.log(`ℹ️  Chain ID: ${info.chainId}`);
        console.log(`ℹ️  Epoch: ${info.committees[0]?.epochId}`);
        console.log(`ℹ️  BLS Key: ${info.committees[0]?.publicKeys?.[0] || 'N/A'}`); // Debugging

        if (info.isRotating) {
            console.log("⚠️  Committee rotation in progress. Transaction might take longer.");
        }
    } catch (e) {
        console.log(`⚠️  Error fetching committee info: ${e.message}`);
    }

    // 3. Encrypt Intent
    console.log("\n🔒 Encrypting Test Bounty...");
    const testRecipient = "0x7890123456789012345678901234567890123456"; // Dummy
    const testAmount = 50;
    let result;
    try {
        result = await biteService.encryptBountyIntent(testRecipient, testAmount, 10, 'TEST-RPT-001');
    } catch (e) {
        console.log(`❌ Encryption threw error: ${e.message}`);
        process.exit(1);
    }

    if (result.simulated) {
        console.log("⚠️  Encryption was SIMULATED (check logs why).");
    } else {
        console.log("✅ Encryption Successful");
        console.log(`   Encrypted 'to': ${result.encryptedTx.to}`);
    }

    // 4. Submit to Chain
    console.log("\n🚀 Submitting to BITE V2 Sandbox 2...");
    let submission;
    try {
        submission = await biteService.submitEncryptedTx(result.encryptedTx);
    } catch (e) {
        console.log(`❌ Submission threw error: ${e.message}`);
        // BiteService catches errors internally and returns simulated, so this catch block might not be hit
        // unless BiteService changes.
    }

    if (submission.status === 'SIMULATED') {
        console.log("⚠️  Submission was SIMULATED.");
        // BiteService logs the error to console, but let's try to capture it if we can modify BiteService
        // or just rely on console output if possible. 
        // Actually, let's just proceed.
    } else {
        console.log(`✅ Transaction Submitted: ${submission.txHash}`);
        console.log(`   Blockscout: ${submission.blockscoutUrl}`);
        console.log(`   Block: ${submission.blockNumber}`);
    }

    // 5. Verify Decryption
    console.log("\n⏳ Waiting for decryption (next block)...");
    const decryption = await biteService.verifyDecryption(submission.txHash);

    if (decryption.verified) {
        console.log("✅ Decryption Verified!");
        console.log(`   Decrypted To: ${decryption.decryptedTo}`);
        console.log(`   Decrypted Data: ${decryption.decryptedData}`);

        // Validate against original
        if (decryption.decryptedTo && decryption.decryptedTo.toLowerCase() === result.encryptedTx.to.toLowerCase()) {
            console.log("🎉 SUCCESS: BITE v2 Integration works!");
        } else if (decryption.simulated) {
            console.log("⚠️  Decryption was SIMULATED.");
        }
    } else {
        console.log("❌ Decryption verification failed.");
    }
}

verifyBiteIntegration().catch(console.error);
