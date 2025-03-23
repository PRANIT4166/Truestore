// require("dotenv").config();
// const User = require("./model/user"); // Ensure correct import
// const Report = require("./model/report"); // Ensure correct import
// const express = require("express");
// const connectDB = require("./db");
// const storage = require("./storage");
// const { checkAndFetchUser } = require("./UserData");
// const cors = require("cors");
// const { ethers } = require("ethers"); // added ethers
// const path = require("path");
// const multer = require("multer");
// const { addDetails } = require("./ReportData");
// const fs = require("fs");



// const app = express();

// // Connect to MongoDB
// connectDB();

// app.use(express.json());
// app.use(cors()) 

// const RPC_URL = process.env.RPC_URL;
// const provider = new ethers.providers.JsonRpcProvider(RPC_URL); //RPC PROVIDER URL
// const CAMPUS_TOKEN_ADDRESS = process.env.CAMPUS_TOKEN_ADDRESS; 
// const PARTICIPATE_ADDRESS = process.env.PARTICIPATE_ADDRESS; 

// const campusTokenABI = require(path.join(__dirname, "artifacts", "contracts", "CampusToken.sol","CampusToken.json"));
// const participateABI = require(path.join(__dirname, "artifacts", "contracts","participate.sol","participate.json"));


// //connect to contracts that have been deployed
// const campusToken = new ethers.Contract(CAMPUS_TOKEN_ADDRESS, campusTokenABI, provider);
// const participate = new ethers.Contract(PARTICIPATE_ADDRESS, participateABI, provider);

// // const router = express.Router();

// // API Route to Check, Fetch, or Create User
// app.post("/api/user", async (req, res) => {
//   const { user_id, name, role, email } = req.body;
  
//   console.log("Incoming user request:", req.body); // Debug log
  
//   try {
//     const user = await checkAndFetchUser(user_id, name, role, email);
//     console.log("User processed:", user); // Debug log
    
//     res.json(user)
//   } catch (error) {
//     console.error("User processing failed:", error);
//       res.status(500).json({ error: "Failed to fetch or create user." });
//     }
//   });
  
//   // app.post("/api/user", async (req, res) => {
//     //     console.log("Incoming request:", req.body); // 🔍 Debugging log
    
//     //     res.json({ message: "API is working!" }); // ✅ Test response
//     //   });
    
    
//     // encrypt pvt key
//     // decrypt pvt key
    
//     const upload = multer({dest : "uploads/"});
    
//     // Upload Route
// app.post("/upload",upload.single("file"), async (req, res) => {

//     console.log("🔥 Upload request received!");
//     console.log("Body:", req.body);  // ✅ Log form fields
//     console.log("File:", req.file);  
//     try {
//         if (!req.file) {
//             return res.status(400).json({ success: false, error: "file required" });
//         }

//         const submittedBy = req.body.submittedBy;
//         const filePath = req.file.path; 
//         // const fileHash = await storage.uploadToIPFS(filePath, submittedBy || "unknown_user");
//         const report_id = await storage.uploadToIPFS(filePath, submittedBy || "unknown_user");


//         fs.unlinkSync(filePath);//delete temp file 


//         res.json({ success: true, report_id });
//     } catch (error) {
//         console.error("Upload failed:", error);
//         res.status(500).json({ success: false, error: error.message || "Upload failed" });
//     }
// });

// app.post("/api/report/details", async (req, res) => {
//     try {
//       const { report_id, vehicle_id, location, description  } = req.body;
  
//       if (!report_id || !vehicle_id || !location || !description) {
//         return res.status(400).json({ success: false, error: "All fields are required." });
//       }
  
//       const updatedReport = await addDetails(report_id, vehicle_id, location, description);
//       res.json({ success: true, report: updatedReport });    

//       const temp_report = await Report.findOne({report_id : report_id});
//       const temp_user = await User.findOne({user_id : temp_report.submitted_by});
//       // stored current user in temp_user and current report in temp_report
//       const walley = new ethers.Wallet(temp_user.private_key, provider); // walley is the wallet address of the current user
//       // submit report on blockchain
//       const tx = await participate.connect(walley).submitReport(report_id);
//       await tx.wait();
//       const new_balance = await campusToken.balanceOf(walley);
//       const bal_in_eth = ethers.utils.formatEther(new_balance);
//       // put bal_in_eth in database
//       temp_user.tokens = parseFloat(bal_in_eth) ;
//       await temp_user.save();

//     } catch (error) {
//       console.error("❌ Error updating report:", error.message);
//       res.status(500).json({ success: false, error: "Failed to update report." });
//     }
//   });

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

require("dotenv").config();
const User = require("./model/user");
const Report = require("./model/report");
const express = require("express");
const connectDB = require("./db");
const storage = require("./storage");
const { checkAndFetchUser } = require("./UserData");
const cors = require("cors");
const ethers = require("ethers"); // Import entire ethers v5 library
const path = require("path");
const multer = require("multer");
const { addDetails } = require("./ReportData");
const fs = require("fs");

const app = express();

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(cors());

// Setup Provider for ethers v5
const RPC_URL = process.env.RPC_URL;
const provider = new ethers.providers.JsonRpcProvider(RPC_URL); // ethers v5 JsonRpcProvider

// Smart Contract Addresses
const CAMPUS_TOKEN_ADDRESS = process.env.CAMPUS_TOKEN_ADDRESS;
const PARTICIPATE_ADDRESS = process.env.PARTICIPATE_ADDRESS;

// Load Contract ABIs using `fs.readFileSync()`
const campusTokenPath = path.join(__dirname, "../smartcontracts/artifacts/contracts/CampusToken.sol/CampusToken.json");
const participatePath = path.join(__dirname, "../smartcontracts/artifacts/contracts/Participate.sol/Participate.json");

// Check if ABI files exist
if (!fs.existsSync(campusTokenPath)) {
    throw new Error(`CampusToken ABI file not found: ${campusTokenPath}`);
}
if (!fs.existsSync(participatePath)) {
    throw new Error(`Participate ABI file not found: ${participatePath}`);
}

// Read and parse ABI files
const campusTokenABI = JSON.parse(fs.readFileSync(campusTokenPath, "utf8"))?.abi;
const participateABI = JSON.parse(fs.readFileSync(participatePath, "utf8"))?.abi;

// Connect to Deployed Smart Contracts
const campusToken = new ethers.Contract(CAMPUS_TOKEN_ADDRESS, campusTokenABI, provider);
const participate = new ethers.Contract(PARTICIPATE_ADDRESS, participateABI, provider);

// API Route to Check, Fetch, or Create User
app.post("/api/user", async (req, res) => {
  const { user_id, name, role, email } = req.body;
  
  console.log("Incoming user request:", req.body); // Debug log
  
  try {
    const user = await checkAndFetchUser(user_id, name, role, email);
    console.log("User processed:", user); // Debug log
    
    res.json(user);
  } catch (error) {
    console.error("User processing failed:", error);
    res.status(500).json({ error: "Failed to fetch or create user." });
  }
});

// Multer Setup for File Uploads
const upload = multer({ dest: "uploads/" });

// Upload Route (Saves file to IPFS)
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "File required" });
        }

        const submittedBy = req.body.submittedBy;
        const filePath = req.file.path;
        const report_id = await storage.uploadToIPFS(filePath, submittedBy || "unknown_user");

        fs.unlinkSync(filePath); // Delete temp file

        res.json({ success: true, report_id });
    } catch (error) {
        console.error("Upload failed:", error);
        res.status(500).json({ success: false, error: error.message || "Upload failed" });
    }
});

// Submit Report & Update Blockchain
app.post("/api/report/details", async (req, res) => {
    try {
        const { report_id, vehicle_id, location, description } = req.body;

        if (!report_id || !vehicle_id || !location || !description) {
            return res.status(400).json({ success: false, error: "All fields are required." });
        }

        // Step 1: Update Report in Database
        const updatedReport = await addDetails(report_id, vehicle_id, location, description);
        res.json({ success: true, report: updatedReport });

        // Step 2: Fetch the Report & User from Database
        const temp_report = await Report.findOne({ report_id });
        if (!temp_report) return res.status(404).json({ success: false, error: "Report not found" });

        const temp_user = await User.findOne({ user_id: temp_report.submitted_by });
        if (!temp_user) return res.status(404).json({ success: false, error: "User not found" });

        // Step 3: Create Wallet Using Stored Private Key (Connected to Provider) - ethers v5
        const wallet = new ethers.Wallet(temp_user.private_key, provider);

        // Step 4: Connect Wallet to Contract & Submit Report - ethers v5
        const participateWithSigner = participate.connect(wallet);
        const tx = await participateWithSigner.submitReport(report_id);
        await tx.wait();

        // Step 5: Fetch & Update User Balance - ethers v5
        const new_balance = await campusToken.balanceOf(temp_user.account);
        const bal_in_eth = ethers.utils.formatEther(new_balance);

        temp_user.tokens = parseFloat(bal_in_eth);
        await temp_user.save();

    } catch (error) {
        console.error("❌ Error updating report:", error.message);
        res.status(500).json({ success: false, error: "Failed to update report." });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));