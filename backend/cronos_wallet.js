/**
 * Cronos Wallet Manager for CivicLens x402
 * Handles wallet connections and transactions on Cronos EVM
 */

const { ethers } = require('ethers');

class CronosWallet {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.connected = false;
        this.network = process.env.CRONOS_CHAIN_ID === '25' ? 'mainnet' : 'testnet';
    }

    /**
     * Connect to Cronos EVM
     */
    async connect() {
        try {
            const rpcUrl = process.env.CRONOS_RPC_URL || 'https://evm-t3.cronos.org';
            this.provider = new ethers.JsonRpcProvider(rpcUrl);

            // Test connection
            await this.provider.getBlockNumber();

            // Load wallet if private key provided
            const privateKey = process.env.PRIVATE_KEY;
            if (privateKey) {
                this.wallet = new ethers.Wallet(privateKey, this.provider);
                console.log(`Wallet loaded: ${this.wallet.address.slice(0, 10)}...`);
            }

            this.connected = true;
            return true;

        } catch (error) {
            console.error("Wallet connection error:", error.message);
            this.connected = false;
            return false;
        }
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.connected && this.wallet !== null;
    }

    /**
     * Get wallet address
     */
    getAddress() {
        return this.wallet?.address || null;
    }

    /**
     * Get wallet balance
     */
    async getBalance() {
        if (!this.isConnected()) {
            return { error: "Wallet not connected" };
        }

        try {
            const balance = await this.provider.getBalance(this.wallet.address);
            const formattedBalance = ethers.formatEther(balance);

            return {
                address: this.wallet.address,
                network: this.network,
                balance: {
                    symbol: this.network === 'mainnet' ? 'CRO' : 'TCRO',
                    amount: parseFloat(formattedBalance),
                    wei: balance.toString()
                }
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Send transaction
     */
    async sendTransaction(to, value, data = '0x') {
        if (!this.isConnected()) {
            throw new Error("Wallet not connected");
        }

        const tx = await this.wallet.sendTransaction({
            to,
            value: ethers.parseEther(value.toString()),
            data
        });

        const receipt = await tx.wait();

        return {
            success: receipt.status === 1,
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        };
    }

    /**
     * Get current gas price
     */
    async getGasPrice() {
        if (!this.provider) return null;

        const feeData = await this.provider.getFeeData();
        return {
            gasPrice: ethers.formatUnits(feeData.gasPrice, 'gwei'),
            maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null
        };
    }

    /**
     * Get explorer URL for transaction
     */
    getExplorerUrl(txHash) {
        const baseUrl = this.network === 'mainnet'
            ? 'https://cronoscan.com'
            : 'https://testnet.cronoscan.com';
        return `${baseUrl}/tx/${txHash}`;
    }
}

module.exports = { CronosWallet };
