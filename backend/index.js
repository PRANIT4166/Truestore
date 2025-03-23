require("dotenv").config();
const express = require("express");
const connectDB = require("./db");
const storage = require("./storage");
const { checkAndFetchUser } = require("./UserData");
const cors = require("cors");
const { ethers } = require("ethers"); // added ethers
const path = require("path");

const app = express();

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(cors()) 

const RPC_URL = process.env.RPC_URL;
const provider = new ethers.providers.JsonRpcProvider(RPC_URL); //RPC PROVIDER URL
const CAMPUS_TOKEN_ADDRESS = process.env.CAMPUS_TOKEN_ADDRESS; 
const PARTICIPATE_ADDRESS = process.env.PARTICIPATE_ADDRESS; 

const campusTokenABI = require(path.join(__dirname, "abis", "CampusToken.json"));
const participateABI = require(path.join(__dirname, "abis", "Participate.json"));


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
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "file required" });
        }

        const submittedBy = req.body.submittedBy;
        const filePath = req.file.path; 
        const fileHash = await storage.uploadToIPFS(filePath, submittedBy || "unknown_user");

        fs.unlinkSync(filePath);//delete temp file 

        res.json({ success: true, fileHash });
    } catch (error) {
        console.error("Upload failed:", error);
        res.status(500).json({ success: false, error: error.message || "Upload failed" });
    }
});


// finds the correct file hash in MongoDB and returns the IPFS URL to the frontend.
app.get("/video/report/:reportId", async (req, res) => {
    try {
        const reportId = req.params.reportId;

        // Find the report by its ID in MongoDB
        const report = await Report.findOne({ report_id: reportId });

        if (!report) {
            return res.status(404).json({ error: "Report not found" });
        }

        // Construct IPFS URL using the file hash from MongoDB
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${report.file_hash}`;

        // Send video URL to frontend
        res.json({ success: true, videoUrl: ipfsUrl });
    } catch (error) {
        console.error("Error fetching video by report ID:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});


// Start Server
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
