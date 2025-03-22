import { useEffect, useState } from "react";
import { auth, logout } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles.css";

import homeicon from '../images/home.png'
import valicon from '../images/report.png'
import val2icon from '../images/validate.png'


const Validate = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Dashboard</h2>
        <ul className="nav-links">
          <li><a href="/home" ><img src={homeicon} alt="Home" className="sidebar-icon"/> Home</a></li>
          <li><a href="/report"><img src={valicon} alt="Home" className="sidebar-icon"/> Report</a></li>
          <li><a href="/validate"><img src={val2icon} alt="validate" className="sidebar-icon"/> Validate</a></li>
        </ul>
        <button onClick={logout} className="logout-btn">Logout</button>
      </aside>

      {/* Main Dashboard */}
      <main className="dashboard">
        <h1>Welcome, {user?.displayName || "User"}</h1>
        

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
            {/* <div className="card">
            <h3>📈 Stats</h3>
            <p>See your analytics in detail.</p>
            </div>
            <div className="card">
            <h3>🔔 Notifications</h3>
            <p>Check your latest alerts.</p>
            </div>
            <div className="card">
            <h3>⚙️ Settings</h3>
            <p>Customize your experience.</p>
            </div> */}
        </div>
      </main>
    </div>
  );
};

export default Validate;
