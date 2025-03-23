
import axios from "axios";


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


const fetchReports = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/reports");
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching reports:", error);
    }
  };

  const fetchVids = async (file_hash: string) => {
    try {
        const response = await axios.post("http://localhost:5000/video/report/getrep", 
            { file_hash }, // ✅ Send file_hash in request body
            { headers: { "Content-Type": "application/json" } } // ✅ Ensure correct headers
        );

        if (response.data.file_url) {
            window.location.href = response.data.file_url; // ✅ Redirect user to the video
        } else {
            console.error("❌ No file URL received.");
            alert("Video not found.");
        }
    } catch (error) {
        console.error("❌ Error fetching video:", error);
        alert("Failed to fetch video. Check console for details.");
    }
};

export { fetchReports, fetchVids }; // ✅ Named exports





