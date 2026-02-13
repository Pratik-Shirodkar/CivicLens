const {
    Coinbase,
    Wallet,
    Asset,
} = require('@coinbase/coinbase-sdk');

class CDPWallet {
    constructor() {
        this.wallet = null;
        this.connected = false;
        // Configure SDK with API keys from environment
        const apiKeyName = process.env.CDP_API_KEY_NAME;
        const privateKey = process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (apiKeyName && privateKey) {
            try {
                Coinbase.configure({ apiKeyName, privateKey });
                this.configured = true;
            } catch (error) {
                console.error("Failed to configure CDP:", error.message);
                this.configured = false;
            }
        } else {
            console.warn("CDP API credentials missing. Wallet will run in simulation mode.");
            this.configured = false;
        }
    }

    /**
     * Initialize/Load MPC Wallet
     * Persists wallet data to local file system for now (simple implementation)
     */
    async init() {
        if (!this.configured) return false;

        try {
            // Check if we have a saved wallet ID
            // For hackathon simplicity, we'll Create a new wallet or re-instantiate if we had persistence
            // Ideally: load from file. Here: Create new for demo or load simple logic.

            // NOTE: In a real app, you MUST securely persist the wallet.
            // For now, we'll try to create a new one each start for simplicity unless we add file persistence.
            // Let's add basic file persistence.
            const fs = require('fs');
            const WALLET_FILE = 'cdp_wallet_data.json';

            if (fs.existsSync(WALLET_FILE)) {
                const data = JSON.parse(fs.readFileSync(WALLET_FILE));
                console.log(`Loading existing wallet ${data.id}...`);
                try {
                    this.wallet = await Wallet.fetch(data.id);
                    // Handle seed loading if exported (not supported in all SDK versions easily, assume fetching by ID works with API key)
                } catch (e) {
                    console.warn("Could not fetch existing wallet, creating new one.");
                    this.wallet = await Wallet.create({ networkId: Coinbase.networks.BaseSepolia });
                }
            } else {
                console.log("Creating new CDP Wallet...");
                this.wallet = await Wallet.create({ networkId: Coinbase.networks.BaseSepolia });
                // Save ID
                fs.writeFileSync(WALLET_FILE, JSON.stringify({ id: this.wallet.getId(), address: await this.wallet.getDefaultAddress().getId() }));
            }

            console.log(`CDP Wallet initialized: ${await this.wallet.getDefaultAddress().getId()}`);
            this.connected = true;
            return true;

        } catch (error) {
            console.error("CDP Wallet initialization error:", error.message);
            return false;
        }
    }

    async getAddress() {
        if (!this.wallet) return null;
        return (await this.wallet.getDefaultAddress()).getId();
    }

    async getBalance() {
        if (!this.wallet) return { error: "Wallet not connected" };
        try {
            const balance = await this.wallet.getBalance(Coinbase.assets.Usdc);
            return {
                address: await this.getAddress(),
                balance: balance.toString(),
                asset: 'USDC'
            };
        } catch (error) {
            console.error("Error getting balance:", error);
            return { error: error.message };
        }
    }

    /**
     * Request funds from faucet (Testnet only)
     */
    async faucet() {
        if (!this.wallet) return false;
        try {
            console.log("Requesting funds from faucet...");
            const tx = await this.wallet.faucet();
            await tx.wait(); // Wait for transaction to confirm
            console.log("Faucet request successful.");
            return true;
        } catch (error) {
            console.error("Faucet error:", error);
            return false;
        }
    }

    /**
     * Transfer funds
     */
    async transfer(to, amount) {
        if (!this.wallet) return { success: false, error: "Wallet not initialized" };

        try {
            console.log(`Transferring ${amount} USDC to ${to}...`);
            const transfer = await this.wallet.createTransfer({
                amount,
                assetId: Coinbase.assets.Usdc,
                destination: to
            });

            await transfer.wait(); // Wait for confirmation

            return {
                success: true,
                txHash: transfer.getTransactionHash(), // Hypothetical method, check SDK docs for exact Accessor
                transferId: transfer.getId()
            };

        } catch (error) {
            console.error("Transfer error:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sign a message for x402 payment authorization
     */
    async signMessage(message) {
        if (!this.wallet) throw new Error("Wallet not initialized");
        try {
            // CDP Wallet (MPC) supports signing arbitrary payloads
            const signature = await this.wallet.createPayloadSignature(message);
            return signature;
        } catch (error) {
            console.error("Signing error:", error);
            throw error;
        }
    }
}

module.exports = { CDPWallet };
