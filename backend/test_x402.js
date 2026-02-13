/**
 * Test Script for x402 Flow
 * Run with: node test_x402.js
 */

require('dotenv').config();
const { CDPWallet } = require('./wallet');
const { VerificationOracle } = require('./verification_oracle');
const { X402Client } = require('./x402_client.js');

async function testFlow() {
    console.log("🚀 Starting x402 Flow Test");

    // 1. Initialize Components
    const oracle = new VerificationOracle();
    // Use a mock wallet for testing if no env vars, or real if present.
    // The CDPWallet class handles missing keys by logging warning and failing init gracefully or using simulation if we added that logic (impl does basic checks).
    // For this test, we want to ensure the X402Client logic works even if wallet is in "simulation" mode or just fails safely.

    // Let's rely on the simulation mode logic I added to verification_oracle.js (it accepts '0x_simulated_payment_hash').
    const wallet = new CDPWallet();

    const agent = new X402Client(oracle, wallet);

    console.log("Initializing Agent Wallet...");
    await agent.init(); // May fail if no keys, but let's see execution flow.

    // 2. Mock Data
    const mockImage = Buffer.from("mock_image_data");
    const mockDescription = "A large pothole on 4th street causing traffic.";

    console.log(`\n📝 Testing Verification Request for: "${mockDescription}"`);

    try {
        const result = await agent.requestVerification(mockImage, mockDescription);

        console.log("\n✅ Verification Result Received:");
        console.log(JSON.stringify(result, null, 2));

        if (result.attestation && result.attestation.signature) {
            console.log("\n🔐 Attestation Signed by Oracle.");
        } else {
            console.error("\n❌ Missing Attestation.");
        }

    } catch (error) {
        console.error("\n❌ Test Failed:", error);
    }
}

testFlow();
