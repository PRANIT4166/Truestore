const express = require("express");
const connectDB = require("./db");
const storage = require("./storage");
const { checkAndFetchUser } = require("./UserData");
const cors = require("cors");


const app = express();

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(cors()) 


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
//     console.log("Incoming request:", req.body); // 🔍 Debugging log
  
//     res.json({ message: "API is working!" }); // ✅ Test response
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

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
