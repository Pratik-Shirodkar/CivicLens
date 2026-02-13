/**
 * Final Push Verification Test
 * Verifies CDP Wallet, AP2 Receipts, and BITE v2 Escrow
 */

const API_URL = 'http://localhost:3001';

async function testFinalPush() {
    console.log("🚀 Starting Final Push Verification...");

    try {
        // 1. Check Health
        console.log("\nChecking backend health...");
        const healthRes = await fetch(`${API_URL}/api/health`);
        const health = await healthRes.json();
        console.log("Backend Health:", JSON.stringify(health, null, 2));

        // 2. Submit Low Severity Report (Normal Flow)
        console.log("\n--- Testing Normal Flow (Low Severity) ---");
        const lowReport = {
            description: "Some graffiti on the wall",
            reporterAddress: "0x1234567890123456789012345678901234567890"
        };
        const lowRes = await fetch(`${API_URL}/api/verify-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lowReport)
        });
        const lowData = await lowRes.json();
        console.log("Low Severity Response:", JSON.stringify(lowData, null, 2));

        if (lowData.ap2Receipt) {
            console.log("✅ AP2 Receipt generated:", lowData.ap2Receipt.id);
        } else {
            console.log("❌ AP2 Receipt missing!");
        }

        // 3. Submit High Severity Report (BITE v2 Escrow Flow)
        console.log("\n--- Testing BITE v2 Flow (High Severity) ---");
        const highReport = {
            description: "MAJOR FLOODING and building collapse risk!! UNBELIEVABLE DAMAGE",
            reporterAddress: "0x1234567890123456789012345678901234567890"
        };
        const highRes = await fetch(`${API_URL}/api/verify-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(highReport)
        });
        const highData = await highRes.json();
        console.log("High Severity Response:", JSON.stringify(highData, null, 2));

        if (highData.bounty.status === 'ESCROW_LOCKED' || highData.bounty.escrowId) {
            console.log("✅ BITE v2 Escrow triggered successfully!");
        } else {
            console.log("❌ BITE v2 Escrow NOT triggered for high severity!");
        }

        // 4. Check Logs for CDP Signing
        console.log("\n--- Checking Logs for CDP Usage ---");
        const logRes = await fetch(`${API_URL}/api/agent/logs`);
        const { logs } = await logRes.json();
        const cdpLogs = logs.filter(l => l.message.includes('CDP'));

        if (cdpLogs.length > 0) {
            console.log("✅ CDP Wallet activity detected in logs.");
        } else {
            console.log("⚠️ No CDP activity in logs. Falling back to EOA is normal if keys not set.");
        }

        console.log("\n✅ Final Push Verification Complete.");

    } catch (error) {
        console.error("❌ Verification failed:", error.message);
    }
}

testFinalPush();
