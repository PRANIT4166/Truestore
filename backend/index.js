const express = require("express");
const connectDB = require("./db");
const storage = require("./storage");

const app = express();

// Connect to MongoDB
connectDB();

app.use(express.json()); // Enable JSON requests

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
