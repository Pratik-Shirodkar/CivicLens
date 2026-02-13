const { X402AgentClient } = require('./x402_client');

(async () => {
    console.log('--- TESTING x402 AGENT FLOW (Local Wallet) ---');

    // Initialize Agent
    const agent = new X402AgentClient({
        onLog: (msg, type) => console.log(`[AGENT] ${msg}`)
    });

    // Mock Report Data
    const report = {
        description: "Large sinkhole appearing on Main St, blocking traffic.",
        lat: 37.7749,
        lng: -122.4194,
        reporterAddress: "0x123..."
    };

    try {
        console.log('Starting execution...');
        const result = await agent.processReport(report);

        console.log('\n--- EXECUTION RESULT ---');
        console.log('Success:', result.success);
        if (result.success) {
            console.log('Verification:', result.isVerified);
            console.log('Risk Score:', result.enrichment?.infrastructure?.riskScore);
            console.log('Total Spend:', result.spend.totalSpendUSD);
        } else {
            console.error('Error:', result.error);
        }

    } catch (e) {
        console.error('CRITICAL TEST FAILURE:', e);
    }
})();
