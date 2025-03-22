const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

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