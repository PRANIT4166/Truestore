require("dotenv").config();
const User = require("./model/user");
const path = require("path");
const fs = require("fs");
const ethers = require("ethers"); 


const RPC_URL = process.env.RPC_URL;
const provider = new ethers.providers.JsonRpcProvider(RPC_URL); // ethers v5 JsonRpcProvider


const CAMPUS_TOKEN_ADDRESS = process.env.CAMPUS_TOKEN_ADDRESS;
const PARTICIPATE_ADDRESS = process.env.PARTICIPATE_ADDRESS;

// Load Contract ABIs using `fs.readFileSync()`
const campusTokenABI = JSON.parse(
    fs.readFileSync(path.join(__dirname, "artifacts", "contracts", "CampusToken.sol", "CampusToken.json"), "utf8")
).abi;

const participateABI = JSON.parse(
    fs.readFileSync(path.join(__dirname, "artifacts", "contracts", "participate.sol", "participate.json"), "utf8")
).abi;

// Connect to Deployed Smart Contracts
const campusToken = new ethers.Contract(CAMPUS_TOKEN_ADDRESS, campusTokenABI, provider);
const participate = new ethers.Contract(PARTICIPATE_ADDRESS, participateABI, provider);

/**
 * Check if user exists; if not, create a new user.
 * @param {string} user_id - Firebase user ID
 * @param {string} name - User's name
 * @param {string} role - User's role
 * @param {string} email - User's email
 * @returns {Promise<Object>} - User data
 */
const checkAndFetchUser = async (user_id, name, role, email) => {
  try {
    let user = await User.findOne({ user_id });

    if (!user) {
      console.log("User not found, creating new user...");
      
      user = new User({
        user_id,
        name,
        role,
        email,
        account: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        private_key: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
      });

      
    // const accounts = await provider.listAccounts();
    // const deployer = await provider.getSigner(accounts[0]);
    // const userrr = provider.getSigner(accounts[1]);
    // const amount = ethers.utils.parseUnits("1000",18);
    // const tx = await campusToken.rewardTokens(await userrr.getAddress(), amount);

    // const new_balance = await campusToken.balanceOf(userrr.account);
    //     const bal_in_eth = formatUnits(new_balance, 18); // ✅ Fix for Ethers v6

    //     user.tokens = parseFloat(bal_in_eth);

      await user.save();
      console.log("✅ User created:", user);
    } else {
      console.log("✅ User exists:", user);
    }

    return user;
  } catch (error) {
    console.error("❌ Database error:", error);
    throw new Error("Failed to fetch or create user.");
  }
};

module.exports = { checkAndFetchUser };