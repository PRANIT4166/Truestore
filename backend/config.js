require('dotenv').config();

const config = {
    storageProvider: "pinata", // Change this later if needed
    pinata: {
            apiKey: process.env.PINATA_API_KEY,  
            secretKey: process.env.PINATA_SECRET,
    },
    mongoURI: process.env.MONGO_URI // MongoDB Connection String
};

module.exports = config;
