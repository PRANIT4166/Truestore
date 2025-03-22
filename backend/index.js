const express = require("express");
const connectDB = require("./db");
const storage = require("./storage");

const app = express();

// Connect to MongoDB
connectDB();

app.use(express.json()); // Enable JSON requests

// Upload Route
app.post("/upload", async (req, res) => {
    try {
        const { filePath, submittedBy } = req.body;
        if (!filePath) {
            return res.status(400).json({ success: false, error: "filePath is required" });
        }

        const fileHash = await storage.uploadToIPFS(filePath, submittedBy || "unknown_user");
        res.json({ success: true, fileHash });
    } catch (error) {
        console.error("Upload failed:", error);
        res.status(500).json({ success: false, error: error.message || "Upload failed" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
