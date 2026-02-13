/**
 * x402 Bounty Manager for CivicLens
 * Handles automatic bounty payments for verified civic reports
 * Integrates real SKALE BITE v2 for conditional encrypted escrows
 */

const { ethers } = require('ethers');

class X402BountyManager {
    /**
     * Bounty tiers based on severity
     * Severity 1-3: Low impact - 1 USDC
     * Severity 4-6: Medium impact - 3 USDC
     * Severity 7-8: High impact - 5 USDC
     * Severity 9-10: Critical - 10 USDC
     */
    static BOUNTY_TIERS = {
        low: { min: 1, max: 3, amount: 1 },
        medium: { min: 4, max: 6, amount: 3 },
        high: { min: 7, max: 8, amount: 5 },
        critical: { min: 9, max: 10, amount: 10 }
    };

    constructor(wallet, biteService = null) {
        this.wallet = wallet;
        this.biteService = biteService; // Real BITE v2 service
        this.payoutHistory = [];
        this.escrows = []; // BITE v2 conditional escrows
        this.maxBounty = parseFloat(process.env.MAX_BOUNTY_USDC) || 10;
        this.defaultBounty = parseFloat(process.env.DEFAULT_BOUNTY_USDC) || 2;
    }

    /**
     * Create a conditional escrow using REAL BITE v2 encryption.
     * Bounty intent is encrypted on SKALE BITE V2 Sandbox 2 chain.
     */
    async createEscrow(recipient, amount, conditionType = "AI_VERIFICATION", reportId = 'RPT-0') {
        const escrowId = `BITE-ESC-${Date.now().toString(36).toUpperCase()}`;

        let biteResult = null;
        let biteTxHash = null;
        let blockscoutUrl = null;

        // Use real BITE v2 SDK if available
        if (this.biteService && this.biteService.connected) {
            try {
                // Step 1: Encrypt bounty intent using BITE threshold encryption
                const encrypted = await this.biteService.encryptBountyIntent(
                    recipient, amount, conditionType === 'AI_VERIFICATION' ? 10 : 7, reportId
                );

                // Step 2: Submit encrypted tx to BITE chain
                biteResult = await this.biteService.submitEncryptedTx(encrypted.encryptedTx);
                biteTxHash = biteResult.txHash;
                blockscoutUrl = biteResult.blockscoutUrl;

                console.log(`[BITE v2] ✅ On-chain escrow created: ${biteTxHash}`);
            } catch (error) {
                console.error(`[BITE v2] On-chain escrow failed, using local: ${error.message}`);
            }
        } else {
            console.log(`[BITE v2] BITE service not connected, using simulation`);
        }

        const escrow = {
            id: escrowId,
            recipient,
            amount,
            currency: 'USDC',
            condition: conditionType,
            status: 'LOCKED',
            biteTxHash: biteTxHash || '0xsim' + Date.now().toString(16),
            blockscoutUrl: blockscoutUrl || null,
            biteChain: 'BITE V2 Sandbox 2',
            biteChainId: 103698795,
            onChain: !!biteTxHash,
            createdAt: new Date().toISOString()
        };

        console.log(`[BITE v2] Escrow ${escrowId} created. Funds locked until ${conditionType} met.`);
        this.escrows.push(escrow);
        return escrow;
    }

    /**
     * Release a conditional escrow.
     * Verifies BITE decryption on-chain, then processes settlement.
     */
    async releaseEscrow(escrowId) {
        const index = this.escrows.findIndex(e => e.id === escrowId);
        if (index === -1) throw new Error("Escrow not found");

        const escrow = this.escrows[index];
        if (escrow.status !== 'LOCKED') throw new Error("Escrow not in LOCKED state");

        console.log(`[BITE v2] Condition met. Releasing escrow ${escrowId}...`);

        // Verify BITE decryption if we have a real tx
        let decryptionResult = null;
        if (this.biteService && this.biteService.connected && escrow.onChain) {
            try {
                decryptionResult = await this.biteService.verifyDecryption(escrow.biteTxHash);
                console.log(`[BITE v2] ✅ On-chain decryption verified for ${escrowId}`);
            } catch (e) {
                console.warn(`[BITE v2] Decryption verification skipped: ${e.message}`);
            }
        }

        const txResult = await this.executeX402Payment(escrow.recipient, escrow.amount);

        escrow.status = 'RELEASED';
        escrow.txHash = txResult.txHash;
        escrow.decryptionVerified = decryptionResult?.verified || false;
        escrow.releasedAt = new Date().toISOString();

        // Add to history
        this.payoutHistory.push({
            id: this.payoutHistory.length + 1,
            recipient: escrow.recipient,
            amount: escrow.amount,
            currency: 'USDC',
            severity: 10,
            description: `BITE v2 Escrow Release: ${escrowId}`,
            txHash: txResult.txHash,
            biteTxHash: escrow.biteTxHash,
            biteVerified: escrow.decryptionVerified,
            escrowId: escrowId,
            timestamp: escrow.releasedAt,
            status: 'COMPLETED'
        });

        return escrow;
    }

    /**
     * Check if bounty system is ready
     */
    isReady() {
        return this.wallet && this.wallet.isConnected();
    }

    /**
     * Calculate bounty amount based on severity
     * @param {number} severity - Severity score (1-10)
     * @returns {number} Bounty amount in USDC
     */
    calculateBounty(severity) {
        const tiers = X402BountyManager.BOUNTY_TIERS;

        if (severity >= tiers.critical.min) return tiers.critical.amount;
        if (severity >= tiers.high.min) return tiers.high.amount;
        if (severity >= tiers.medium.min) return tiers.medium.amount;
        if (severity >= tiers.low.min) return tiers.low.amount;

        return 0; // No bounty for severity 0
    }

    /**
     * Get bounty tiers for display
     */
    getBountyTiers() {
        return X402BountyManager.BOUNTY_TIERS;
    }

    /**
     * Process bounty payment via x402
     * 
     * @param {string} reporterAddress - Wallet address of the reporter
     * @param {number} amount - Bounty amount in USDC
     * @param {number} severity - Report severity
     * @param {string} reportDescription - Brief description for reference
     * @returns {Object} Transaction result
     */
    async processBounty(reporterAddress, amount, severity, reportDescription) {
        // High severity (9+) uses REAL BITE v2 conditional escrow
        if (severity >= 9) {
            console.log(`[BITE v2] High severity detected (${severity}). Initiating on-chain conditional escrow...`);
            const reportId = `RPT-${Date.now().toString(36)}`;
            const escrow = await this.createEscrow(reporterAddress, amount, 'AI_VERIFICATION', reportId);

            // Auto-release after AI final verification (demo: 3s delay)
            setTimeout(() => this.releaseEscrow(escrow.id).catch(e => console.error(`Release failed: ${e.message}`)), 3000);

            return {
                success: true,
                escrowId: escrow.id,
                biteTxHash: escrow.biteTxHash,
                blockscoutUrl: escrow.blockscoutUrl,
                biteChain: escrow.biteChain,
                onChain: escrow.onChain,
                status: 'ESCROW_LOCKED',
                message: `Bounty encrypted on BITE V2 Sandbox. TX: ${escrow.biteTxHash?.substring(0, 18)}...`
            };
        }

        if (!this.isReady()) {
            console.log("Bounty system not ready - simulating payment");
            return this.simulateBounty(reporterAddress, amount, severity, reportDescription);
        }

        try {
            console.log(`Processing x402 bounty payment:`);
            console.log(`  Recipient: ${reporterAddress}`);
            console.log(`  Amount: ${amount} USDC`);
            console.log(`  Severity: ${severity}`);

            // In production, this would:
            // 1. Call the CivicLensBounty smart contract
            // 2. The contract verifies and transfers USDC
            // 3. Emits BountyPaid event

            // For demo, we'll simulate the transaction
            const txResult = await this.executeX402Payment(reporterAddress, amount);

            // Record payout
            const payout = {
                id: this.payoutHistory.length + 1,
                recipient: reporterAddress,
                amount,
                currency: 'USDC',
                severity,
                description: reportDescription,
                txHash: txResult.txHash,
                timestamp: new Date().toISOString(),
                status: txResult.success ? 'COMPLETED' : 'FAILED'
            };

            this.payoutHistory.push(payout);

            return {
                success: txResult.success,
                txHash: txResult.txHash,
                payout
            };

        } catch (error) {
            console.error("Bounty processing error:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Execute x402 payment (would use x402 Facilitator SDK in production)
     */
    async executeX402Payment(recipient, amount) {
        // In production, this would use @crypto.com/facilitator-client
        // 
        // const facilitator = new FacilitatorClient({
        //     rpcUrl: process.env.CRONOS_RPC_URL,
        //     privateKey: process.env.PRIVATE_KEY
        // });
        // 
        // const tx = await facilitator.transfer({
        //     to: recipient,
        //     token: process.env.USDC_ADDRESS,
        //     amount: ethers.parseUnits(amount.toString(), 6)
        // });

        // For demo, simulate successful transaction
        const mockTxHash = `0x${Array(64).fill(0).map(() =>
            Math.floor(Math.random() * 16).toString(16)
        ).join('')}`;

        console.log(`  Simulated x402 payment: ${mockTxHash}`);

        return {
            success: true,
            txHash: mockTxHash,
            blockNumber: Math.floor(Math.random() * 1000000) + 10000000
        };
    }

    /**
     * Simulate bounty for when wallet not connected
     */
    simulateBounty(reporterAddress, amount, severity, reportDescription) {
        const mockTxHash = `0xsim${Date.now().toString(16)}${'0'.repeat(50)}`.slice(0, 66);

        const payout = {
            id: this.payoutHistory.length + 1,
            recipient: reporterAddress,
            amount,
            currency: 'USDC',
            severity,
            description: reportDescription,
            txHash: mockTxHash,
            timestamp: new Date().toISOString(),
            status: 'SIMULATED'
        };

        this.payoutHistory.push(payout);

        return {
            success: true,
            txHash: mockTxHash,
            payout,
            note: "Simulated - wallet not connected"
        };
    }

    /**
     * Get payout history
     */
    getPayoutHistory(limit = 50) {
        return this.payoutHistory.slice(-limit).reverse();
    }

    /**
     * Get active escrows
     */
    getEscrows() {
        return this.escrows;
    }

    /**
     * Get total payouts
     */
    getTotalPayouts() {
        return {
            count: this.payoutHistory.length,
            totalAmount: this.payoutHistory.reduce((sum, p) => sum + p.amount, 0),
            currency: 'USDC'
        };
    }
}

module.exports = { X402BountyManager };
