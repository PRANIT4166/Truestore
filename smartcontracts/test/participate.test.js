const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("Participate Contract", function () {
    let CampusToken, Participate, token, participate, owner, user1, user2, user3;

    beforeEach(async function () {
        await network.provider.send("hardhat_reset"); // ✅ Reset blockchain state before each test

        [owner, user1, user2, user3] = await ethers.getSigners();

        // ✅ Deploy CampusToken contract
        CampusToken = await ethers.getContractFactory("CampusToken");
        token = await CampusToken.deploy(owner.address, owner.address);
        await token.deployed(); // ✅ Fix for Hardhat v5

        // ✅ Deploy Participate contract with the token address
        Participate = await ethers.getContractFactory("participate");
        participate = await Participate.deploy(token.address);
        await participate.deployed(); // ✅ Fix for Hardhat v5

        // ✅ Mint and distribute tokens to users for testing
        await token.mint(user1.address, ethers.utils.parseUnits("500", 18));
        await token.mint(user2.address, ethers.utils.parseUnits("500", 18));
        await token.mint(user3.address, ethers.utils.parseUnits("10", 18));
    });

    it("Should allow a user to submit a report", async function () {
        await token.connect(user1).approve(participate.address, ethers.utils.parseUnits("100", 18));
        await participate.connect(user1).submitReport(); // ✅ Updated function name

        const report = await participate.reports(1);
        expect(report.uploader).to.equal(user1.address);
        expect(report.net_votes).to.equal(0);
        expect(report.validated).to.equal(false);
    });

    it("Should not allow reporting without enough stake", async function () {
        await expect(participate.connect(user3).submitReport()).to.be.revertedWith("Insufficient stake");
    });

    it("Should allow a user to validate a report", async function () {
        await token.connect(user1).approve(participate.address, ethers.utils.parseUnits("100", 18));
        await participate.connect(user1).submitReport(); // ✅ Updated function name

        await token.connect(user2).approve(participate.address, ethers.utils.parseUnits("50", 18));
        await participate.connect(user2).validate(1, 1); // ✅ No change needed

        const report = await participate.reports(1);
        expect(report.net_votes).to.equal(1);
    });

    it("Should not allow double voting", async function () {
        await token.connect(user1).approve(participate.address, ethers.utils.parseUnits("100", 18));
        await participate.connect(user1).submitReport();

        await token.connect(user2).approve(participate.address, ethers.utils.parseUnits("50", 18));
        await participate.connect(user2).validate(1, 1);

        await expect(participate.connect(user2).validate(1, -1)).to.be.revertedWith("Already voted");
    });

    it("Should finalize a report and distribute rewards correctly", async function () {
        await token.connect(user1).approve(participate.address, ethers.utils.parseUnits("100", 18));
        await participate.connect(user1).submitReport();

        await token.connect(user2).approve(participate.address, ethers.utils.parseUnits("50", 18));
        await participate.connect(user2).validate(1, 1);

        await participate.finalizeReport(1);
        const report = await participate.reports(1);
        expect(report.validated).to.equal(true);
    });

    it("Should allow a user to revoke their vote", async function () {
        await token.connect(user1).approve(participate.address, ethers.utils.parseUnits("100", 18));
        await participate.connect(user1).submitReport();

        await token.connect(user2).approve(participate.address, ethers.utils.parseUnits("50", 18));
        await participate.connect(user2).validate(1, 1);

        await participate.connect(user2).revoke_vote(1); // ✅ Updated function name

        const report = await participate.reports(1);
        expect(report.net_votes).to.equal(0);
    });


    it("Should not allow finalizing an already finalized report", async function () {
        await token.connect(user1).approve(participate.address, ethers.utils.parseUnits("100", 18));
        await participate.connect(user1).submitReport();

        await token.connect(user2).approve(participate.address, ethers.utils.parseUnits("50", 18));
        await participate.connect(user2).validate(1, 1);

        await participate.finalizeReport(1);
        await expect(participate.finalizeReport(1)).to.be.revertedWith("Already validated");
    });

    it("Should reward validators for correct votes", async function () {
        await token.connect(user1).approve(participate.address, ethers.utils.parseUnits("100", 18));
        await participate.connect(user1).submitReport();

        await token.connect(user2).approve(participate.address, ethers.utils.parseUnits("50", 18));
        await participate.connect(user2).validate(1, 1);

        await participate.finalizeReport(1);

        const user2Balance = await token.balanceOf(user2.address);
        expect(user2Balance).to.be.above(ethers.utils.parseUnits("500", 18)); // Validator should receive reward
    });

 
});
