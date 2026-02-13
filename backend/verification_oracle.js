/**
 * x402 Verification Oracle Service
 * Acts as a paid service that agents interact with to verify reports.
 * 
 * Flow:
 * 1. Agent requests quote for verification.
 * 2. Agent pays Oracle (in USDC/ETH).
 * 3. Oracle runs AI verification (AWS Rekognition/Bedrock).
 * 4. Oracle signs the result (Attestation).
 * 5. Oracle returns signed result to Agent.
 */

const { analyzeIncident } = require('./aws_ai_service');
const { ethers } = require('ethers');

class VerificationOracle {
    constructor() {
        // In a real implementation, the Oracle would have its own wallet/signer
        // to sign attestations.
        this.wallet = ethers.Wallet.createRandom(); // For demo, random
        this.verificationCost = '0.01'; // USDC
    }

    /**
     * Get quote for verification service
     */
    getQuote() {
        return {
            service: 'CivicLens AI Verification',
            cost: this.verificationCost,
            currency: 'USDC',
            oracleAddress: this.wallet.address
        };
    }

    /**
     * Verify an incident report
     * Requires proof of payment (mocked for now)
     * 
     * @param {Buffer} imageBuffer - Image data
     * @param {string} description - Incident description
     * @param {string} paymentTxHash - Transaction hash proving payment
     */
    async verify(imageBuffer, description, paymentTxHash) {
        console.log(`[Oracle] Received verification request.`);
        console.log(`[Oracle] Checking payment: ${paymentTxHash}...`);

        // Mock payment verification
        if (!paymentTxHash) {
            throw new Error("Payment required for verification service.");
        }

        console.log(`[Oracle] Payment verified. Running AI analysis...`);

        // Run AI Analysis
        const aiResult = await analyzeIncident(imageBuffer, description);

        // Create attestation
        const attestation = {
            reporterDescription: description,
            isVerified: aiResult.isVerified,
            severity: aiResult.severity,
            timestamp: Date.now(),
            oracleAddress: this.wallet.address
        };

        // Sign the attestation
        const message = JSON.stringify(attestation);
        const signature = await this.wallet.signMessage(message);

        console.log(`[Oracle] verification complete. Signed result.`);

        return {
            ...aiResult,
            attestation: {
                data: attestation,
                signature
            }
        };
    }
}

module.exports = { VerificationOracle };
