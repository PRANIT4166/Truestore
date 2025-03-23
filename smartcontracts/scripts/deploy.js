const hre = require("hardhat");
const RPC_URL = process.env.RPC_URL;
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

async function main() {
    const accounts = await provider.listAccounts();
    const deployer = await provider.getSigner(accounts[0]);

    console.log(`Deploying contracts with the account: ${deployer.address}`);

    // Deploy CampusToken
    const CampusToken = await hre.ethers.getContractFactory("CampusToken");
    const campusToken = await CampusToken.deploy(deployer.address, deployer.address);
    await campusToken.deployed();
    console.log(` CampusToken deployed to: ${campusToken.address}`);

    //  Deploy Participate Contract
    const Participate = await hre.ethers.getContractFactory("participate");
    const participate = await Participate.deploy(campusToken.address);
    await participate.deployed();
    console.log(` Participate contract deployed to: ${participate.address}`);
}

//  Run the deployment script
main().catch((error) => {
    console.error(error);
    process.exit(1);
});