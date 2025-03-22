import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import googleLogo from "../images/web_neutral_rd_na@1x.png";
import "../styles.css"; // Import CSS

const Login = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/home"); // Redirect if user is verified
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      setError("Authentication failed. Please try again.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>Welcome</h2>
        <p>Sign in with Google to continue</p>

        <button className="google-btn"
        onClick={handleLogin}
        >
          <img src={googleLogo} alt="Google Logo" />
          <span>Sign in with Google</span>
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
