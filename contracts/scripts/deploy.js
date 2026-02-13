import hre from "hardhat";

async function main() {
    console.log("Deploying CivicLensBounty...");

    const CivicLensBounty = await hre.ethers.getContractFactory("CivicLensBounty");
    const bounty = await CivicLensBounty.deploy("0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0");

    await bounty.waitForDeployment();

    const address = await bounty.getAddress();
    console.log(`CivicLensBounty deployed to: ${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
