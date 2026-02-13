import "@nomicfoundation/hardhat-ethers";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../backend/.env");
dotenv.config({ path: envPath });

/** @type import('hardhat/config').HardhatUserConfig */
export default {
    solidity: "0.8.20",
    networks: {
        cronos_testnet: {
            url: process.env.CRONOS_RPC_URL || "https://evm-t3.cronos.org",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 338
        }
    }
};
