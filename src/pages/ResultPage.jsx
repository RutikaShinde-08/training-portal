import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ref, get } from "firebase/database";
import { database } from "../firebase";
import "../styles/resultpage.css"; // Imported the professional metric results stylesheet

function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      const snapshot = await get(ref(database, `attempts/${id}`));

      if (snapshot.exists()) {
        setResult(snapshot.val());
      }
    };

    fetchResult();
  }, [id]);

  if (!result) {
    return <h2 className="result-status-msg">Loading Result...</h2>;
  }

  return (
    <div className="result-page-container">
      <div className={`result-card ${result.passed ? "state-passed" : "state-failed"}`}>
        <h1 className="result-main-title">Quiz Result</h1>
        <h2 className="result-course-title">{result.videoTitle}</h2>

        <div className="result-stats-display">
          <div className="stat-box">
            <span className="stat-label">Final Score</span>
            <span className="stat-value">{result.score}%</span>
          </div>

          <div className="stat-box">
            <span className="stat-label">Accuracy</span>
            <span className="stat-subtext">
              <strong>{result.correct}</strong> correct out of <strong>{result.total}</strong>
            </span>
          </div>
        </div>

        <div className="result-verdict-badge">
          {result.passed ? "PASS" : "FAIL"}
        </div>

        <div className="result-actions-zone">
          {result.passed ? (
            <button
              onClick={() => navigate(`/certificate/${id}`)}
              className="btn-result-primary btn-pass"
            >
              Download Certificate
            </button>
          ) : (
            <button
              onClick={() => navigate(`/video/${result.videoId}`)}
              className="btn-result-primary btn-fail"
            >
              Retry Training
            </button>
          )}
          
          <button 
            onClick={() => navigate("/dashboard")} 
            className="btn-result-secondary"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultPage;