import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home"; // Create this page next
import Report from "./components/reportPage"; // Create this page next
import Validate from "./components/Valideate"; // Create this page next
 // Create this page next


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/report" element={<Report />} />
        <Route path="/validate" element={<Validate />} />
      </Routes>
    </Router>
  );
}

export default App;
