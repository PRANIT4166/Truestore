import { useEffect, useState } from "react";
import { auth, logout } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useUser } from "../uderContext";
import axios from "axios";

import "../styles.css";

import homeicon from '../images/home.png'
import valicon from '../images/report.png'
import val2icon from '../images/validate.png'


const Home = () => {
  const { userData, setUserData } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async (currentUser: User | null) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      setUser(currentUser);

      axios.post("http://localhost:5000/api/user", {
        user_id: currentUser.uid,
        name: currentUser.displayName,
        role: "user",
        email: currentUser.email,
      })
      .then((response) => {
        console.log("Fetched User Data:", response.data);
        setUserData(response.data); // ✅ Store globally in React Context
      })
      .catch((error) => {
        console.error("❌ Error fetching user data:", error);
      });
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      fetchUser(currentUser);
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
      <div className="welcome-container">
        <h1>
          Welcome, {userData?.name || "User"}👋
        </h1>
        <p className="email">{userData?.email}</p>
        <p className="overview">Your dashboard overview:</p>
      </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          <div className="card-home">
            <div className="stats">
              <h3>📈 Stats</h3>
              <p className="tokens">Your Tokens: {userData?.tokens}</p>
            </div>
          </div>
          <div className="card-home">
          <div className="rep">
            <h3>Report</h3>
            <p className="info">Report an incident of rash driving that takes place in front of you . Fill in the details, and upload a video/photo of the incident. Stake in 25 token to participate and get 100 token if your evidence is found to be valid.
            </p>
            </div>
          </div>
          <div className="card-home">
          <div className="rep">
            <h3>Validate</h3>
            <p className="info"> Participate in the  validation process , make an informed decision by clicking on the file. Stake - 50 reward - 100 . Improve your rank by gaining rewards by choosing correct.
            </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
