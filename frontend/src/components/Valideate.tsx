import { useEffect, useState } from "react";
import { auth, logout } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useUser } from "../uderContext";
import axios from "axios";

import {fetchReports , fetchVids} from "../valaidateData"


import "../styles.css";

import homeicon from '../images/home.png'
import valicon from '../images/report.png'
import val2icon from '../images/validate.png'

interface Report {
  _id: string;
  report_id: string;
  file_hash: string;
  metadata: {
    loc: string;
    time: string;
    vehicle: string;
    desc: string;
  };
  status: string;
  submitted_by: string;
  submitted_at: string;
}




const Validate = () => {

  const { userData } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth,async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
        try {
          const rep = await fetchReports(); // ✅ Fetch reports using backend function
          if (rep) setReports(rep);
          } catch (error) {
              console.error("❌ Error fetching reports:", error);
          }
      }
    });


    return () => unsubscribe();
  }, [navigate]);


    const handleValidation = async (reportId: string, vote: boolean) => {
      try {
        const response = await axios.post("http://localhost:5000/api/validate", {
          report_id: reportId,
          validator_id: userData?.user_id,
          vote, // ✅ true = Authentic, false = Unreliable
        });
  
        if (response.data.success) {
          alert(`✅ Report marked as ${vote ? "verified" : "rejected"}`);
          setReports(reports.filter((report) => report.report_id !== reportId)); // Remove validated report
        } else {
          alert("❌ You have already validated this report.");
        }
      } catch (error) {
        console.error("❌ Validation error:", error);
        alert("Validation failed. Check console for details.");
      }
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
  
          {/* Validation Grid */}
          <div className="dashboard-grid-val">
            {reports.length > 0 ? (
              reports.map((report) => (
                <div key={report._id} className="card validate-card">
                  <h3>Report #{report.report_id}</h3>
                  <button className="fetch-btn" onClick={() => fetchVids(report.file_hash)}>
                    🔍 Fetch Evidence
                  </button>
                  <p className="vec"><strong>Vehicle:</strong> {report.metadata.vehicle}</p>
                  <p className="loc"><strong>Location:</strong> {report.metadata.loc}</p>
                  <p className="desc"><strong>Description:</strong> {report.metadata.desc}</p>
  
                  {/* Validation Buttons ✅❌  */}
                  <div className="validation-buttons">
                    <button className="authentic-btn" onClick={() => handleValidation(report.report_id, true)}>Authentic</button>
                    <button className="unreliable-btn" onClick={() => handleValidation(report.report_id, false)}>Unreliable</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-view">No reports available for validation.</p>
            )}
          </div>
        </main>
      </div>
    );
  };
  
  export default Validate;