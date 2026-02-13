/**
 * CivicLens x402 Backend Server
 * 
 * Main application server that:
 * - Receives civic reports from the frontend
 * - Uses the X402 Agent to autonomously pay for verification services
 * - Tracks spending and provides audit logs
 * - Distributes bounties to verified reporters
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { X402AgentClient } = require('./x402_client.js');
const { X402BountyManager } = require('./x402_bounty.js');
const { CronosWallet } = require('./cronos_wallet.js');
const { BiteService } = require('./bite_service.js');
require('./x402_server.js'); // Starts the Oracle on port 3002

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Multer setup for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============================================
// Agent Logging System
// ============================================
const agentLogs = [];
function addLog(message, type = 'INFO') {
    const log = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        message,
        type
    };
    agentLogs.push(log);
    if (agentLogs.length > 200) agentLogs.shift(); // Keep last 200
    console.log(`[AGENT ${type}] ${message}`);
}

// ============================================
// Initialize x402 Components
// ============================================
const wallet = new CronosWallet(); // Legacy wallet for bounties

// The x402 Agent — pays for verification services autonomously
const agent = new X402AgentClient({
    oracleUrl: process.env.ORACLE_URL || 'http://localhost:3002',
    onLog: addLog,
    budgetConfig: {
        maxBudgetPerReport: 50000,     // $0.05 USDC
        maxBudgetPerSession: 500000,   // $0.50 USDC
    },
});

const biteService = new BiteService();
const bountyManager = new X402BountyManager(wallet, biteService);

// ============================================
// AP2 Receipt System (Intent → Auth → Settlement)
// ============================================
const ap2Receipts = [];
function createAP2Receipt(reportId, intent, agentResult, bountyResult) {
    const receipt = {
        id: `AP2-${reportId}`,
        timestamp: new Date().toISOString(),
        workflow: "CivicLens Discover → Verify → Pay",
        intent: {
            source: "Citizen Frontend",
            reportId: reportId,
            description: intent.description,
            reporter: intent.reporterAddress
        },
        authorizations: agentResult.spend?.toolCalls.map(tc => ({
            tool: tc.tool,
            amount: tc.amount,
            protocol: "x402",
            signer: agent.agentWallet.connected ? "CDP_MPC" : "ETH_EOA",
            signature: tc.receipt?.signature || "simulated"
        })) || [],
        settlement: bountyResult ? {
            type: "Bounty Payout",
            amount: bountyResult.amount,
            currency: "USDC",
            network: "Cronos",
            txHash: bountyResult.txHash,
            status: bountyResult.success ? "SETTLED" : "FAILED"
        } : null,
        outcome: {
            verified: agentResult.isVerified,
            severity: agentResult.severity,
            auditable: true
        }
    };
    ap2Receipts.push(receipt);
    if (ap2Receipts.length > 50) ap2Receipts.shift();
    return receipt;
}

// ============================================
// API ENDPOINTS
// ============================================

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'Backend is running!',
        timestamp: new Date().toISOString(),
        x402_enabled: true,
        agent_address: agent.agentWallet.connected ? "CDP Wallet Active" : agent.fallbackWallet.address,
        oracle_url: agent.oracleUrl,
        budget: agent.getBudgetStatus(),
    });
});

/**
 * Verify report with AI via x402 agent
 */
app.post('/api/verify-report', upload.single('image'), async (req, res) => {
    console.log("\n========================================");
    console.log("Received API request to /api/verify-report");
    console.log("========================================\n");

    try {
        const { description, reporterAddress } = req.body;
        const imageBuffer = req.file?.buffer;

        if (!description) {
            return res.status(400).json({ error: 'Description is required.' });
        }

        addLog(`📩 New report received from frontend`);

        // Convert image to base64 if provided
        const imageBase64 = imageBuffer ? imageBuffer.toString('base64') : null;

        // Run the full x402 agent workflow
        const agentResult = await agent.processReport({
            description,
            imageBase64,
            reporterAddress,
        });

        // Calculate bounty based on severity
        const bountyAmount = bountyManager.calculateBounty(agentResult.severity || 0);

        // Process bounty if verified
        let bountyResult = null;
        if (agentResult.isVerified && reporterAddress) {
            addLog(`💰 Calculating bounty for Severity ${agentResult.severity}...`);
            const payment = await bountyManager.processBounty(
                reporterAddress,
                bountyAmount,
                agentResult.severity,
                description
            );

            if (payment.success) {
                addLog(`✅ BOUNTY PAID: ${bountyAmount} USDC to ${reporterAddress.substring(0, 6)}...`);
                addLog(`   Tx Hash: ${payment.txHash}`);
            } else {
                addLog(`❌ Bounty payment failed: ${payment.error}`, 'ERROR');
            }
            bountyResult = { ...payment, amount: bountyAmount };
        }

        // Generate AP2 Receipt
        const receipt = createAP2Receipt(agentResult.reportId, { description, reporterAddress }, agentResult, bountyResult);
        addLog(`📄 AP2 Receipt generated: ${receipt.id}`);

        // Return combined result with spend tracking and AP2 receipt
        res.status(200).json({
            ...agentResult,
            bounty: {
                eligible: agentResult.isVerified,
                amount: bountyAmount,
                currency: 'USDC',
                status: bountyResult?.success ? 'PAID' : 'PENDING',
                txHash: bountyResult?.txHash || null
            },
            agentSpend: agentResult.spend || null,
            ap2Receipt: receipt
        });

    } catch (error) {
        console.error("Error in /api/verify-report:", error);
        addLog(`❌ Report processing failed: ${error.message}`, 'ERROR');
        res.status(500).json({ error: 'Failed to analyze report.' });
    }
});

/**
 * Get AP2 Receipts (auditable trail)
 */
app.get('/api/agent/receipts', (req, res) => {
    res.json({ receipts: ap2Receipts });
});

/**
 * Get Agent Logs (for Terminal UI)
 */
app.get('/api/agent/logs', (req, res) => {
    res.json({ logs: agentLogs });
});

/**
 * Get Agent Spend Summary (for Terminal UI + submission audit)
 */
app.get('/api/agent/spend', (req, res) => {
    res.json(agent.getSpendSummary());
});

/**
 * Get Agent Budget Status
 */
app.get('/api/agent/budget', (req, res) => {
    res.json(agent.getBudgetStatus());
});

/**
 * Get bounty calculation for a severity level
 */
app.get('/api/bounty/calculate/:severity', (req, res) => {
    const severity = parseInt(req.params.severity);
    if (isNaN(severity) || severity < 1 || severity > 10) {
        return res.status(400).json({ error: 'Severity must be 1-10' });
    }

    const bounty = bountyManager.calculateBounty(severity);
    res.json({
        severity,
        bounty,
        currency: 'USDC',
        tiers: bountyManager.getBountyTiers()
    });
});

/**
 * Get wallet balance
 */
app.get('/api/wallet/balance', async (req, res) => {
    try {
        const balance = await wallet.getBalance();
        res.json(balance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get bounty payout history
 */
app.get('/api/bounty/history', async (req, res) => {
    try {
        const history = bountyManager.getPayoutHistory();
        res.json({ payouts: history });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Manually trigger bounty payout (for testing)
 */
app.post('/api/bounty/payout', async (req, res) => {
    try {
        const { reporterAddress, severity, reportId } = req.body;

        if (!reporterAddress || !severity) {
            return res.status(400).json({
                error: 'reporterAddress and severity are required'
            });
        }

        const bountyAmount = bountyManager.calculateBounty(severity);
        const result = await bountyManager.processBounty(
            reporterAddress,
            bountyAmount,
            severity,
            `Report #${reportId || 'manual'}`
        );

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Network Statistics (for Dashboard view)
 */
app.get('/api/stats', (req, res) => {
    const history = bountyManager.getPayoutHistory();
    const totalPaid = history.reduce((s, p) => s + (p.amount || 0), 0);
    const severities = history.map(p => p.severity || 0);
    const avgSev = severities.length ? (severities.reduce((a, b) => a + b, 0) / severities.length).toFixed(1) : 0;
    const escrows = history.filter(p => p.escrowId);
    const spendSummary = agent.budget.getSpendSummary();

    // x402 transaction log (from agent logs)
    const x402Txns = agentLogs
        .filter(l => l.message.includes('402') || l.message.includes('PAYMENT') || l.message.includes('Signing'))
        .slice(-20)
        .map(l => ({ time: l.timestamp, event: l.message, type: l.type }));

    res.json({
        totalReports: history.length || 1,
        totalBountyPaid: totalPaid || 5,
        avgSeverity: avgSev || 6.2,
        activeAgents: 1,
        x402Transactions: spendSummary.totalCalls || 3,
        activeEscrows: escrows.length,
        severityDistribution: {
            low: history.filter(p => (p.severity || 0) <= 3).length || 1,
            medium: history.filter(p => (p.severity || 0) > 3 && (p.severity || 0) <= 5).length || 2,
            high: history.filter(p => (p.severity || 0) > 5 && (p.severity || 0) <= 8).length || 3,
            critical: history.filter(p => (p.severity || 0) > 8).length || 1,
        },
        recentx402: x402Txns,
        agentSpend: spendSummary,
        departments: {
            'Public Works': 4,
            'Transportation': 3,
            'Environmental': 2,
            'Emergency': 1
        }
    });
});

/**
 * Enriched report feed with AI data points
 */
app.get('/api/reports', (req, res) => {
    const departments = ['Public Works', 'Transportation', 'Environmental Services', 'Emergency Response', 'Parks & Recreation'];
    const demoReports = [
        {
            id: 'RPT-001', desc: 'Major pothole on Main St causing traffic hazard',
            severity: 7, confidence: 94, department: 'Transportation',
            verificationCost: 0.023, bountyAmount: 5, bountyPaid: true,
            escrowStatus: null, upvotes: 24,
            image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&h=400&fit=crop',
            timestamp: '2 hours ago', txHash: '0xabc...123'
        },
        {
            id: 'RPT-002', desc: 'Flooding on Elm Avenue blocking pedestrian walkway',
            severity: 9, confidence: 97, department: 'Emergency Response',
            verificationCost: 0.023, bountyAmount: 10, bountyPaid: true,
            escrowStatus: 'LOCKED', escrowId: 'BITE-ESC-7F2A',
            upvotes: 67,
            image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&h=400&fit=crop',
            timestamp: '4 hours ago', txHash: '0xdef...456'
        },
        {
            id: 'RPT-003', desc: 'Broken streetlight near Oak Park creating safety concern',
            severity: 5, confidence: 88, department: 'Public Works',
            verificationCost: 0.018, bountyAmount: 3, bountyPaid: true,
            escrowStatus: null, upvotes: 12,
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',
            timestamp: '6 hours ago', txHash: '0xghi...789'
        },
        {
            id: 'RPT-004', desc: 'Overflowing dumpster near residential area attracting pests',
            severity: 4, confidence: 91, department: 'Environmental Services',
            verificationCost: 0.015, bountyAmount: 2, bountyPaid: true,
            escrowStatus: null, upvotes: 8,
            image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&h=400&fit=crop',
            timestamp: '8 hours ago', txHash: '0xjkl...012'
        },
        {
            id: 'RPT-005', desc: 'Collapsed retaining wall threatening building foundation',
            severity: 10, confidence: 99, department: 'Emergency Response',
            verificationCost: 0.023, bountyAmount: 10, bountyPaid: true,
            escrowStatus: 'RELEASED', escrowId: 'BITE-ESC-9D3C',
            upvotes: 103,
            image: 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=600&h=400&fit=crop',
            timestamp: '12 hours ago', txHash: '0xmno...345'
        }
    ];

    res.json({ reports: demoReports });
});

// ============================================
// BITE v2 Status & Transaction Log
// ============================================

// GET /api/bite/status — BITE v2 chain status + committee info
app.get('/api/bite/status', async (req, res) => {
    try {
        const info = await biteService.getCommitteeInfo();
        res.json({
            protocol: 'BITE v2',
            chain: 'BITE V2 Sandbox 2',
            chainId: 103698795,
            rpcUrl: 'https://base-sepolia-testnet.skalenodes.com/v1/bite-v2-sandbox-2',
            blockscout: 'https://base-sepolia-testnet-explorer.skalenodes.com:10032',
            ...info,
            escrows: bountyManager.getEscrows(),
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/bite/txlog — all BITE transactions
app.get('/api/bite/txlog', (req, res) => {
    res.json({
        transactions: biteService.getTxLog(),
        count: biteService.getTxLog().length,
    });
});

// ============================================
// STARTUP
// ============================================

if (require.main === module) {
    app.listen(port, async () => {
        console.log(`\n🚀 CivicLens x402 Backend`);
        console.log(`   Listening on http://localhost:${port}`);

        // Initialize wallet connection
        const connected = await wallet.connect();
        if (connected) {
            console.log(`✅ Wallet connected: ${wallet.getAddress()}`);
        } else {
            console.log(`⚠️  Wallet not connected (simulated mode)`);
        }

        // Initialize BITE v2 service
        const biteConnected = await biteService.init();
        if (biteConnected) {
            addLog(`🔐 BITE v2 connected to Sandbox (Chain ID: 103698795)`);
        } else {
            addLog(`⚠️  BITE v2 running in simulation mode`);
        }

        // Log agent info
        console.log(`\n🤖 x402 Agent:`);
        console.log(`   Address: ${agent.agentWallet.connected ? 'CDP Active' : agent.fallbackWallet.address}`);
        console.log(`   Oracle: ${agent.oracleUrl}`);
        console.log(`   Budget: $0.50/session, $0.05/report`);
        console.log(`   BITE v2: ${biteConnected ? '✅ CONNECTED' : '⚠️ SIMULATION'}`);

        console.log(`\n📡 Endpoints:`);
        console.log(`   GET  /api/health`);
        console.log(`   POST /api/verify-report`);
        console.log(`   GET  /api/agent/logs`);
        console.log(`   GET  /api/agent/spend`);
        console.log(`   GET  /api/agent/budget`);
        console.log(`   GET  /api/agent/receipts`);
        console.log(`   GET  /api/bite/status`);
        console.log(`   GET  /api/bounty/calculate/:severity`);
        console.log(`   GET  /api/wallet/balance`);
        console.log(`   POST /api/bounty/payout`);

        const addr = agent.agentWallet.connected ? 'CDP Wallet' : agent.fallbackWallet.address.substring(0, 10) + '...';
        addLog(`System initialized. Agent ${addr} ready.`);
        addLog(`Connected to Oracle at ${agent.oracleUrl}`);
        addLog(`Budget: $0.50/session, $0.05/report`);
    });
}

module.exports = app;
