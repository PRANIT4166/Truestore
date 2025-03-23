// const User = require("./model/user"); // Ensure correct import
// const path = require("path");


// /**
//  * Check if user exists; if not, create a new user.
//  * @param {string} ser_ - Firebase ser_
//  * @param {string} name - User's name
//  * @param {string} role -   User's role, email
//  * @returns {Promise<Object>} - User data
// */

// import { JsonRpcProvider, Wallet, Contract } from "ethers"; 

// const RPC_URL = process.env.RPC_URL;
// const provider = new JsonRpcProvider(RPC_URL); //RPC PROVIDER URL
// const CAMPUS_TOKEN_ADDRESS = process.env.CAMPUS_TOKEN_ADDRESS; 
// const PARTICIPATE_ADDRESS = process.env.PARTICIPATE_ADDRESS; 

// const campusTokenABI = require(path.join(__dirname, "artifacts", "contracts", "CampusToken.sol","CampusToken.json"));
// const participateABI = require(path.join(__dirname, "artifacts", "contracts","participate.sol","participate.json"));


// const campusToken = new ethers.Contract(CAMPUS_TOKEN_ADDRESS, campusTokenABI, provider);
// const participate = new ethers.Contract(PARTICIPATE_ADDRESS, participateABI, provider);

// const checkAndFetchUser = async (user_id, name, role, email) => {
//   try {
//     let user = await User.findOne({ user_id });

//     if (!user) {
//       console.log("User not found, creating new user..."); // Debug log
//       //creating wallet for the new user
//       const wallet = ethers.Wallet.createRandom();
//       const account = wallet.address;
//       const privateKey = wallet.privateKey;

//       // encryption step
//       // const encryptedPrivateKey = new User().encryptPrivateKey(privateKey,SECRET_KEY); 

//       user = new User({ user_id, 
//         name,
//         role, 
//         email,
//         account,
//         private_key : privateKey
//        }); // changed from PRANIT

//        const tx = await campusToken.connect(account).rewardTokens(account,1000 * 10 ** 18);
//        await tx.wait();

//       await user.save();
//       console.log("User created:", user);
//     } else {
//       console.log("User exists:", user);
//     }

//     return user;
//   } catch (error) {
//     console.error("Database error:", error);
//     throw new Error("Failed to fetch or create user.");
//   }
// };

// module.exports = { checkAndFetchUser };

require("dotenv").config();
const User = require("./model/user");
const path = require("path");
const fs = require("fs");
const ethers = require("ethers"); // Import entire ethers v5 library

// Setup Provider for ethers v5
const RPC_URL = process.env.RPC_URL;
const provider = new ethers.providers.JsonRpcProvider(RPC_URL); // ethers v5 JsonRpcProvider

// Smart Contract Addresses
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

      // Step 1: Create New Wallet for User (ethers v5)
      const wallet = ethers.Wallet.createRandom();
      const account = wallet.address;
      const privateKey = wallet.privateKey;

      // Step 2: Store User in Database
      user = new User({
        user_id,
        name,
        role,
        email,
        account,
        private_key: privateKey,
      });

      // Step 3: Fund User with Initial Tokens (ethers v5)
      const walletWithProvider = wallet.connect(provider);
      const campusTokenWithSigner = campusToken.connect(walletWithProvider);
      const tx = await campusTokenWithSigner.rewardTokens(account, ethers.utils.parseUnits("1000", 18));
      await tx.wait();

      // Step 4: Save User to Database
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