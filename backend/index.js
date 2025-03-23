require("dotenv").config();
const express = require("express");
const connectDB = require("./db");
const storage = require("./storage");
const { checkAndFetchUser } = require("./UserData");
const cors = require("cors");
const { ethers } = require("ethers"); // added ethers
const path = require("path");
const multer = require("multer");
const { addDetails } = require("./ReportData");
const fs = require("fs");
const Validation = require("./model/validation");
const Report = require("./model/report")
const mongoose = require("mongoose");



const app = express();

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(cors()) 
app.use(express.urlencoded({ extended: true }));

// const RPC_URL = process.env.RPC_URL;
// const provider = new ethers.providers.JsonRpcProvider(RPC_URL); //RPC PROVIDER URL
// const CAMPUS_TOKEN_ADDRESS = process.env.CAMPUS_TOKEN_ADDRESS; 
// const PARTICIPATE_ADDRESS = process.env.PARTICIPATE_ADDRESS; 

// const campusTokenABI = require(path.join(__dirname, "artifacts", "contracts", "CampusToken.sol","CampusToken.json"));
// const participateABI = require(path.join(__dirname, "artifacts", "contracts","participate.sol","participate.json"));



// const router = express.Router();

// API Route to Check, Fetch, or Create User
app.post("/api/user", async (req, res) => {
    const { user_id, name, role, email } = req.body;
  
    console.log("Incoming user request:", req.body); // Debug log
  
    try {
      const user = await checkAndFetchUser(user_id, name, role, email);
      console.log("User processed:", user); // Debug log
      
      res.json(user)
    } catch (error) {
      console.error("User processing failed:", error);
      res.status(500).json({ error: "Failed to fetch or create user." });
    }
  });

// app.post("/api/user", async (req, res) => {
//     console.log("Incoming request:", req.body); // Debugging log
  
//     res.json({ message: "API is working!" }); // Test response
//   });



const upload = multer({dest : "uploads/"});

// Upload Route
app.post("/upload",upload.single("file"), async (req, res) => {

    console.log("🔥 Upload request received!");
    console.log("Body:", req.body);  // ✅ Log form fields
    console.log("File:", req.file);  
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "file required" });
        }

        const submittedBy = req.body.submittedBy;
        const filePath = req.file.path; 
        // const fileHash = await storage.uploadToIPFS(filePath, submittedBy || "unknown_user");
        const report_id = await storage.uploadToIPFS(filePath, submittedBy || "unknown_user");


        fs.unlinkSync(filePath);//delete temp file 


        res.json({ success: true, report_id });
    } catch (error) {
        console.error("Upload failed:", error);
        res.status(500).json({ success: false, error: error.message || "Upload failed" });
    }
});


// finds the correct file hash in MongoDB and returns the IPFS URL to the frontend.
app.post("/video/report/getrep", async (req, res) => {
  console.log("🔍 Request received:", req.body); // ✅ Check what frontend is sending

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



  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await Report.find({ status: "pending" });
      res.json(reports);
    } catch (error) {
      console.error("❌ Error fetching reports:", error);
      res.status(500).json({ success: false, error: "Failed to fetch reports." });
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

      // report.status = vote ? "verified" : "rejected";
      // await report.save();

      res.json({ success: true, message: `Report validation saved successfully.` });
    } catch (error) {
      console.error("❌ Validation error:", error);
      res.status(500).json({ success: false, error: "Validation failed." });
    }
  });

// Start Server

app.get("/", (req, res) => {
  res.send("🚀 Backend is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// function createReportUI(reportId) {
//     const reportContainer = document.getElementById("reportList");

//     // Create a new report item
//     const div = document.createElement("div");
//     div.innerHTML = `<p>Report ID: ${reportId}</p>`;

//     const button = document.createElement("button");
//     button.innerText = "Show Video";
//     button.onclick = () => fetchVideoByReportId(reportId); // Fetch video when clicked

//     div.appendChild(button);
//     reportContainer.appendChild(div);
// }

// // Example reports (Replace this with dynamic reports from backend)
// createReportUI("12345");
// createReportUI("67890");


// // Call this when the page loads
// fetchPendingReports();



// async function fetchVideoByReportId(reportId) {
//     try {
//         const response = await fetch(`http://localhost:5000/video/report/${reportId}`);
//         const data = await response.json();

//         if (data.success) {
//             document.getElementById("videoPlayer").src = data.videoUrl;
//             document.getElementById("videoPlayer").style.display = "block"; // Show video
//         } else {
//             console.error("Error fetching video:", data.error);
//         }
//     } catch (error) {
//         console.error("Error:", error);
//     }
// }



//video player code 

{/* <div id="reportList"></div> <!-- This is where reports will be listed -->

<video id="videoPlayer" width="600" controls style="display:none;">
    Your browser does not support the video tag.
</video> */}
