/**
 * BITE v2 Service for CivicLens
 * 
 * Real integration with SKALE BITE V2 Sandbox 2 chain.
 * Uses @skalenetwork/bite SDK for encrypted conditional transactions.
 * 
 * Flow:
 *   1. Encrypt bounty intent → bite.encryptTransaction(tx)
 *   2. Submit encrypted tx to BITE chain
 *   3. After block finality → bite.getDecryptedTransactionData(txHash)
 */

const { BITE } = require('@skalenetwork/bite');
const { ethers } = require('ethers');

// BITE V2 Sandbox 2 chain details
const BITE_CONFIG = {
    rpcUrl: process.env.BITE_RPC_URL || 'https://base-sepolia-testnet.skalenodes.com/v1/bite-v2-sandbox-2',
    chainId: 103698795,
    chainIdHex: '0x62e516b',
    biteContract: '0xc4083B1E81ceb461Ccef3FDa8A9F24F0d764B6D8',
    blockscoutUrl: 'https://base-sepolia-testnet-explorer.skalenodes.com:10032',
};

class BiteService {
    constructor() {
        this.bite = null;
        this.provider = null;
        this.signer = null;
        this.connected = false;
        this.txLog = [];
    }

    /**
     * Initialize BITE SDK and connect to the Sandbox chain
     */
    async init() {
        try {
            const privateKey = process.env.BITE_PRIVATE_KEY || process.env.PRIVATE_KEY;
            if (!privateKey || privateKey === 'your_private_key_here') {
                console.warn('[BITE v2] No private key configured. Running in simulation mode.');
                return false;
            }

            // Initialize BITE SDK
            this.bite = new BITE(BITE_CONFIG.rpcUrl);

            // Initialize ethers provider + signer for the BITE chain
            this.provider = new ethers.JsonRpcProvider(BITE_CONFIG.rpcUrl);
            this.signer = new ethers.Wallet(privateKey, this.provider);

            // Verify connectivity
            const network = await this.provider.getNetwork();
            const address = this.signer.address;
            const balance = await this.provider.getBalance(address);

            console.log(`[BITE v2] Connected to BITE V2 Sandbox 2`);
            console.log(`[BITE v2]   Chain ID: ${network.chainId}`);
            console.log(`[BITE v2]   Address: ${address}`);
            console.log(`[BITE v2]   sFUEL Balance: ${ethers.formatEther(balance)} ETH`);

            if (balance === 0n) {
                console.warn(`[BITE v2] ⚠️  No sFUEL! Get some from https://gateway.kobaru.io`);
            }

            // Check committee info
            try {
                const committees = await this.bite.getCommitteesInfo();
                console.log(`[BITE v2]   Committee Epoch: ${committees[0]?.epochId}`);
                console.log(`[BITE v2]   BLS Key: ${committees[0]?.commonBLSPublicKey?.substring(0, 16)}...`);
                if (committees.length === 2) {
                    console.log(`[BITE v2]   ⚠️  Committee rotation in progress`);
                }
            } catch (e) {
                console.warn(`[BITE v2] Could not fetch committee info: ${e.message}`);
            }

            this.connected = true;
            return true;
        } catch (error) {
            console.error(`[BITE v2] Initialization failed: ${error.message}`);
            this.connected = false;
            return false;
        }
    }

    /**
     * Encrypt a bounty payout intent using BITE threshold encryption.
     * The to and data fields are encrypted so no one can front-run or see the payout details
     * until the SKALE consensus decrypts them in the next block.
     * 
     * @param {string} recipient - Wallet address of the bounty recipient
     * @param {number} amount - Bounty amount in USDC
     * @param {number} severity - Report severity score
     * @param {string} reportId - Report identifier
     * @returns {Object} { encryptedTx, originalIntent }
     */
    async encryptBountyIntent(recipient, amount, severity, reportId) {
        if (!this.connected) {
            console.log('[BITE v2] Not connected, using simulation mode');
            return this._simulateEncryption(recipient, amount, severity, reportId);
        }

        try {
            // Encode the bounty intent as tx data
            // We encode: recipient address + amount + severity + reportId into the data field
            const abiCoder = ethers.AbiCoder.defaultAbiCoder();
            const encodedData = abiCoder.encode(
                ['address', 'uint256', 'uint8', 'string'],
                [recipient, ethers.parseUnits(amount.toString(), 6), severity, reportId]
            );

            const tx = {
                to: BITE_CONFIG.biteContract,
                data: encodedData,
            };

            console.log(`[BITE v2] Encrypting bounty intent...`);
            console.log(`[BITE v2]   Recipient: ${recipient}`);
            console.log(`[BITE v2]   Amount: $${amount} USDC`);
            console.log(`[BITE v2]   Severity: ${severity}`);

            // BITE encrypts the `to` and `data` fields
            const encryptedTx = await this.bite.encryptTransaction(tx);

            console.log(`[BITE v2] ✅ Intent encrypted successfully`);
            console.log(`[BITE v2]   Encrypted 'to': ${encryptedTx.to?.substring(0, 20)}...`);

            return {
                encryptedTx,
                originalIntent: {
                    recipient,
                    amount,
                    severity,
                    reportId,
                    encodedData,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error(`[BITE v2] Encryption failed: ${error.message}`);
            return this._simulateEncryption(recipient, amount, severity, reportId);
        }
    }

    /**
     * Submit encrypted transaction to the BITE V2 Sandbox chain.
     * 
     * @param {Object} encryptedTx - The encrypted transaction from encryptBountyIntent
     * @returns {Object} { txHash, blockNumber }
     */
    async submitEncryptedTx(encryptedTx) {
        if (!this.connected) {
            return this._simulateSubmit();
        }

        try {
            console.log(`[BITE v2] Submitting encrypted transaction to BITE chain...`);

            // Send the encrypted transaction
            // We attach 0.1 sFUEL to cover BITE decryption costs (similar to CTX_GAS_PAYMENT)
            // and use a high gas limit to ensure it processes.
            const tx = await this.signer.sendTransaction({
                to: encryptedTx.to,
                data: encryptedTx.data,
                value: ethers.parseEther("0.1"),
                gasLimit: 2500000,
            });

            console.log(`[BITE v2] ✅ Tx submitted: ${tx.hash}`);

            // Wait for confirmation
            const receipt = await tx.wait();
            console.log(`[BITE v2] ✅ Confirmed in block ${receipt.blockNumber}`);

            const logEntry = {
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                timestamp: new Date().toISOString(),
                blockscoutUrl: `${BITE_CONFIG.blockscoutUrl}/tx/${tx.hash}`,
                status: 'CONFIRMED',
            };

            this.txLog.push(logEntry);
            return logEntry;
        } catch (error) {
            console.error(`[BITE v2] Submit failed: ${error.message}`);
            return this._simulateSubmit();
        }
    }

    /**
     * Verify that the BITE consensus has decrypted our transaction data.
     * 
     * @param {string} txHash - Transaction hash from submitEncryptedTx
     * @returns {Object} { decryptedTo, decryptedData, verified }
     */
    async verifyDecryption(txHash) {
        if (!this.connected || !this.bite) {
            return this._simulateDecryption(txHash);
        }

        try {
            console.log(`[BITE v2] Verifying decryption for tx ${txHash}...`);

            // Wait a block for decryption
            const currentBlock = await this.provider.getBlockNumber();
            let nextBlock = currentBlock;
            let attempts = 0;
            while (nextBlock <= currentBlock && attempts < 30) {
                await new Promise(r => setTimeout(r, 1000));
                nextBlock = await this.provider.getBlockNumber();
                attempts++;
            }

            // Fetch the decrypted data
            const decrypted = await this.bite.getDecryptedTransactionData(txHash);

            console.log(`[BITE v2] ✅ Decrypted successfully`);
            console.log(`[BITE v2]   Original 'to': ${decrypted.to}`);
            console.log(`[BITE v2]   Original 'data': ${decrypted.data?.substring(0, 40)}...`);

            // Update tx log
            const logEntry = this.txLog.find(t => t.txHash === txHash);
            if (logEntry) {
                logEntry.decrypted = true;
                logEntry.decryptedTo = decrypted.to;
                logEntry.decryptedData = decrypted.data;
            }

            return {
                decryptedTo: decrypted.to,
                decryptedData: decrypted.data,
                verified: true,
                txHash,
            };
        } catch (error) {
            console.error(`[BITE v2] Decryption verification failed: ${error.message}`);
            return this._simulateDecryption(txHash);
        }
    }

    /**
     * Get committee info for display / status
     */
    async getCommitteeInfo() {
        if (!this.connected || !this.bite) {
            return { connected: false, simulation: true };
        }

        try {
            const committees = await this.bite.getCommitteesInfo();
            return {
                connected: true,
                simulation: false,
                chainId: BITE_CONFIG.chainId,
                rpcUrl: BITE_CONFIG.rpcUrl,
                address: this.signer.address,
                committees: committees.map(c => ({
                    epochId: c.epochId,
                    publicKeyPrefix: c.commonBLSPublicKey?.substring(0, 32) + '...',
                })),
                isRotating: committees.length === 2,
                blockscoutUrl: BITE_CONFIG.blockscoutUrl,
                txCount: this.txLog.length,
            };
        } catch (error) {
            return { connected: true, simulation: false, error: error.message };
        }
    }

    /**
     * Get all BITE transaction logs
     */
    getTxLog() {
        return this.txLog;
    }

    // ---- Simulation fallbacks ----

    _simulateEncryption(recipient, amount, severity, reportId) {
        console.log(`[BITE v2] (SIMULATED) Encrypting intent for $${amount} → ${recipient}`);
        return {
            encryptedTx: {
                to: '0x' + Buffer.from('BITE_ENCRYPTED_RECIPIENT').toString('hex').padEnd(40, '0'),
                data: '0x' + Buffer.from(`BITE_ENC:${recipient}:${amount}:${severity}:${reportId}`).toString('hex'),
            },
            originalIntent: {
                recipient, amount, severity, reportId,
                encodedData: '0xsimulated',
                timestamp: new Date().toISOString()
            },
            simulated: true
        };
    }

    _simulateSubmit() {
        const simHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        console.log(`[BITE v2] (SIMULATED) Tx hash: ${simHash}`);
        const entry = {
            txHash: simHash,
            blockNumber: Math.floor(Math.random() * 10000000),
            timestamp: new Date().toISOString(),
            blockscoutUrl: `${BITE_CONFIG.blockscoutUrl}/tx/${simHash}`,
            status: 'SIMULATED',
        };
        this.txLog.push(entry);
        return entry;
    }

    _simulateDecryption(txHash) {
        console.log(`[BITE v2] (SIMULATED) Decryption verified for ${txHash}`);
        return {
            decryptedTo: BITE_CONFIG.biteContract,
            decryptedData: '0xsimulated_decrypted_data',
            verified: true,
            txHash,
            simulated: true
        };
    }
}

module.exports = { BiteService, BITE_CONFIG };
