const pinataSDK = require("@pinata/sdk"); 
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const Report = require("./model/report"); // MongoDB Model

dotenv.config(); // Load environment variables

// Ensure Pinata credentials exist
if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET) {
    throw new Error("Missing Pinata API credentials in .env file");
}

// Correct Pinata initialization for v2.1.0

// const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET);
const pinata = new pinataSDK({
    pinataApiKey: process.env.PINATA_API_KEY,
    pinataSecretApiKey: process.env.PINATA_SECRET
});



async function uploadToIPFS(filePath, submittedBy = "unknown_user") {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const readableStreamForFile = fs.createReadStream(filePath);
        const options = { pinataMetadata: { name: path.basename(filePath) } };

        // Upload file to IPFS via Pinata
        const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
        console.log("File uploaded to IPFS:", result.IpfsHash);

        // Save the IPFS hash to MongoDB
        const newReport = new Report({
            report_id: new Date().getTime().toString(), // Unique ID
            file_hash: result.IpfsHash,
            metadata: { loc: "Unknown", time: new Date(), vehicle: "Unknown" },
            status: "pending",
            submitted_by: submittedBy, // Use dynamic user ID if available
            submitted_at: new Date(),
        });

        try {
            await newReport.save();
            console.log("File hash saved to MongoDB:", newReport);
        } catch (dbError) {
            console.error("Failed to save to MongoDB:", dbError);
        }

        return newReport.report_id;
    } catch (error) {
        console.error("Error uploading file:", error.message || error);
        throw error;
    }
}

module.exports = { uploadToIPFS };
