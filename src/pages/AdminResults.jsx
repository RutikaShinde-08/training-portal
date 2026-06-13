import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { database } from "../firebase";
import { Link } from "react-router-dom"; // Added for seamless navigation path compliance
import "../styles/adminresults.css"; // Imported modern metrics log dashboard style sheet

function AdminResults() {
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    const fetchAttempts = async () => {
      const snapshot = await get(ref(database, "attempts"));

      if (snapshot.exists()) {
        const data = snapshot.val();

        const attemptsArray = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .sort(
            (a, b) =>
              new Date(b.submittedAt) - new Date(a.submittedAt)
          );

        setAttempts(attemptsArray);
      }
    };

    fetchAttempts();
  }, []);

  return (
    <div className="results-dashboard-container">
      {/* Dashboard Top Identity Meta Row */}
      <div className="results-header-row">
        <div>
          <div className="back-link-wrapper">
            <Link to="/admin" className="btn-results-back">← Admin Dashboard</Link>
          </div>
          <h1 className="results-main-title">Employee Assessment Log</h1>
          <p className="results-subtitle">Review corporate quiz submissions, look up individual fractional metrics, and verify training milestones.</p>
        </div>
      </div>

      {/* Main Table Metrics Shell Display Card */}
      <div className="results-table-card-wrapper">
        {attempts.length === 0 ? (
          <div className="empty-results-fallback">
            <h3>No Records Captured</h3>
            <p>Employees haven't finalized or submitted any training module evaluation checks yet.</p>
          </div>
        ) : (
          <table className="corporate-results-table">
            <thead>
              <tr>
                <th style={{ width: "20%" }}>Employee Profile</th>
                <th style={{ width: "30%" }}>Assigned Course Module</th>
                <th style={{ width: "12%", textAlign: "center" }}>Percentage Score</th>
                <th style={{ width: "12%", textAlign: "center" }}>Raw Score Key</th>
                <th style={{ width: "12%", textAlign: "center" }}>Certification Status</th>
                <th style={{ width: "14%", textAlign: "right" }}>Completed On</th>
              </tr>
            </thead>

            <tbody>
              {attempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td>
                    <div className="employee-user-name">{attempt.userName}</div>
                  </td>
                  <td>
                    <div className="module-title-string">{attempt.videoTitle}</div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`percentage-badge ${attempt.passed ? "text-pass" : "text-fail"}`}>
                      {attempt.score}%
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <code className="raw-fraction-code">
                      {attempt.correct} / {attempt.total}
                    </code>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`status-pill-badge ${attempt.passed ? "pill-pass" : "pill-fail"}`}>
                      {attempt.passed ? "PASSED" : "FAILED"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="localized-date-stamp">
                      {new Date(attempt.submittedAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminResults;