# IPFS Video Validation System

## 1. Project Overview
This project enables validators to verify and approve videos stored on IPFS via Pinata. Reports are automatically removed once a decision is reached.

## 2. User Authentication and Functionalities

### 2.1 User Login
- Users log in using their Google account for authentication.
- Once logged in, users are provided with two options: **Report** and **Validate**.

### 2.2 Reporting an Incident
- Users can report an incident of rash driving by entering details and uploading a video.
- Uploading requires a fee, and once completed, the user gains a reward for successfully reporting the incident.

### 2.3 Validating a Video
- Users can verify a video and vote on its validity.
- Once a consensus is reached, the final decision is determined.
- Validators gain rewards for correct decisions and lose tokens for incorrect decisions.

### 2.4 Wallet Balance
- Users can view their wallet balance at all times within the application.

### 2.5 Storage Information
- Videos are stored on **IPFS (Pinata)**, which generates a **CID (hash)**.
- The CID is stored in the database and used for data retrieval from IPFS later.

## 3. Smart Contract (Blockchain)

### 3.1 Logic and Working
- There are two `.sol` files: **CampusToken** and **participate**.
- **CampusToken** is the Solidity smart contract for the CampusTokens we wish to create.
- **participate** handles all the functions that interact with the backend.
- **CampusTokens** are virtual, non-tradable tokens used within the platform to incentivize and regulate participation.

### 3.2 Unit Tests
- Navigate into the `/smartcontracts` directory.
- Run the following command to execute tests:
  ```sh
  npx hardhat test
  ```
- The test cases are located in the `/test` folder.
- The results for both **CampusTokens** and **participate** can be viewed after running the tests.

## 4. Installation and Setup

### 4.1 Prerequisites
Ensure you have the following installed:
- **Node.js** (v18+)
- **MongoDB** (Local)
- **Pinata Account** (For IPFS storage)
- **Blockchain Dependencies:** Hardhat, ethers.js, waffle, chai
- **Frontend Dependencies:** React, CSS

### 4.2 Clone the Repository
```sh
git clone https://github.com/sameerdattav/Truestore.git
```

### 4.3 Install Dependencies
```sh
cd backend
npm install
```

### 4.4 Start the Backend Server
```sh
node index.js
```
Server running on [http://localhost:5000](http://localhost:5000)

### 4.5 Start the Frontend Server
```sh
cd ..
cd frontend
npm run
```
Server running on [http://localhost:5173/login](http://localhost:5173/login)

## 5. Technologies Used
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Storage:** IPFS via Pinata
- **Frontend:** React.js
- **Blockchain:** Solidity
- **Web3 Interaction:** ethers.js

## 6. Contributors
- **Sameer Dattav** ([sameerdattav](https://github.com/sameerdattav))
- **Abhik** ([Abhik13](https://github.com/Abhik13))
- **Pranit** ([PRANIT4166](https://github.com/PRANIT4166))

---

Feel free to contribute, raise issues, and suggest improvements!
