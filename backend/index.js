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
const Validation = require("./model/validation");
const mongoose = require("mongoose");


const app = express();

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


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
app.post("/api/user", async (req, res) => {
    console.log("Incoming request:", req.body); // Debugging log
  
    res.json({ message: "API is working!" }); // Test response
  });

// Upload Route (Saves file to IPFS)
const upload = multer({ dest: "uploads/" });
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


// finds the correct file hash in MongoDB and returns the IPFS URL to the frontend.
app.post("/video/report/getrep", async (req, res) => {
  console.log("🔍 Request received:", req.body); 

  try {
      const { file_hash } = req.body; // ✅ Extract file_hash

      if (!file_hash) {
          console.log("❌ Missing file_hash in request!");
          return res.status(400).json({ error: "file_hash is required" });
      }

      console.log("🔍 Fetching video for:", file_hash);

      // ✅ Return file URL
      res.json({ success: true, file_url: `https://gateway.pinata.cloud/ipfs/${file_hash}` });

  } catch (error) {
      console.error("❌ Error fetching video:", error);
      res.status(500).json({ error: "Failed to fetch video." });
  }
});

app.post("/api/report/details", async (req, res) => {
    try {
        const { report_id, vehicle_id, location, description } = req.body;

        if (!report_id || !vehicle_id || !location || !description) {
            return res.status(400).json({ success: false, error: "All fields are required." });
        }

        const updatedReport = await addDetails(report_id, vehicle_id, location, description);
        res.json({ success: true, report: updatedReport });


    } catch (error) {
        console.error("❌ Error updating report:", error.message);
        res.status(500).json({ success: false, error: "Failed to update report." });
    }
});


  app.post("/api/validate", async (req, res) => {
    const { report_id, validator_id, vote } = req.body;
  
    try {
      // Check if the report exists
      const report = await Report.findOne({ report_id });
      if (!report) {
        return res.status(404).json({ success: false, error: "Report not found." });
      }
  
      // Check if the validator has already voted on this report
      const existingValidation = await Validation.findOne({ report_id, validator_id });
      if (existingValidation) {
        return res.status(400).json({ success: false, error: "You have already voted on this report." });
      }
  
      // ✅ Store validation vote in MongoDB
      const validation = new Validation({
        validation_id: new mongoose.Types.ObjectId().toString(), // Generate unique ID
        report_id,
        validator_id,
        vote, // true = Authentic, false = Unreliable
      });
  
      await validation.save();

      res.json({ success: true, message: `Report validation saved successfully.` });
    } catch (error) {
      console.error("❌ Validation error:", error);
      res.status(500).json({ success: false, error: "Validation failed." });
    }
  });


  app.get("/api/reports/unvalidated", async (req, res) => {
    try {
        const { validator_id } = req.query;
        if (!validator_id) {
            return res.status(400).json({ success: false, error: "Validator ID is required." });
        }

        // Fetch all reports
        const allReports = await Report.find();

        // Fetch reports already validated by the user
        const validatedReports = await Validation.find({ validator_id }).select("report_id");

        // Extract report IDs from validation records
        const validatedReportIds = validatedReports.map(v => v.report_id);

        // Filter reports to exclude validated ones
        const unvalidatedReports = allReports.filter(report => !validatedReportIds.includes(report.report_id));

        res.json({ success: true, reports: unvalidatedReports });
    } catch (error) {
        console.error("❌ Error fetching unvalidated reports:", error);
        res.status(500).json({ success: false, error: "Failed to fetch reports." });
    }
});

// Start Server

app.get("/", (req, res) => {
  res.send("🚀 Backend is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
