import { auth, logout } from "../firebase";
import { useState } from "react";
import "../styles.css";
import { useUser } from "../uderContext";

import homeicon from '../images/home.png'
import valicon from '../images/report.png'
import val2icon from '../images/validate.png'


const Report = () => {
  const { userData } = useUser();
  const [vehicleId, setVehicleId] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Handle File Selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  // Handle Form Submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // 🚀 Implement API call to upload data
    console.log("Submitting Report:", { vehicleId, location, description, file });

    // Reset form after submission
    setVehicleId("");
    setLocation("");
    setDescription("");
    setFile(null);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Dashboard</h2>
        <ul className="nav-links">
          <li><a href="/home"><img src={homeicon} alt="Home" className="sidebar-icon" /> Home</a></li>
          <li><a href="/report"><img src={valicon} alt="Report" className="sidebar-icon" /> Report</a></li>
          <li><a href="/validate"><img src={val2icon} alt="Validate" className="sidebar-icon" /> Validate</a></li>
        </ul>
        <button onClick={logout} className="logout-btn">Logout</button>
      </aside>

      {/* Main Dashboard */}
      <main className="dashboard">
        <div className="welcome-container">
          <h1>Welcome, {userData?.name || "User"} 👋</h1>
          <p className="token">Token Balance: {userData?.tokens}</p>
        </div>

        {/* 🚀 Report Incident Form */}
        <div className="card-report">
          <h3>📢 Report an Incident</h3>
          <form onSubmit={handleSubmit}>
            {/* Vehicle ID */}
            <input 
              type="text" 
              placeholder="Vehicle ID" 
              value={vehicleId} 
              onChange={(e) => setVehicleId(e.target.value)} 
              required 
            />

            {/* Location */}
            <input 
              type="text" 
              placeholder="Location" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              required 
            />

            {/* Description */}
            <input
              placeholder="Description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
            />

            {/* File Upload */}
            <input 
              type="file" 
              accept="image/*,video/*" 
              onChange={handleFileChange} 
              required
            />
            {file && <p>Selected file: {file.name}</p>}

            {/* Submit Button */}
            <button type="submit" className="submit-btn">Submit Report</button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Report;