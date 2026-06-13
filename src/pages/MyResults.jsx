import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { auth, database } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../styles/myresults.css";

function MyResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snapshot = await get(ref(database, "attempts"));

      if (snapshot.exists()) {
        const data = snapshot.val();

        const userResults = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .filter((attempt) => attempt.userId === user.uid)
          .sort(
            (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
          );

        setResults(userResults);
      }

      setLoading(false);
    };

    fetchResults();
  }, []);

  if (loading) return <h2>Loading My Results...</h2>;

  return (
   <div className="results-page">
      <h1>My Results</h1>

      {results.length === 0 ? (
        <p>No quiz attempts yet.</p>
      ) : (
       <table className="results-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Score</th>
              <th>Correct</th>
              <th>Status</th>
              <th>Date</th>
              <th>Certificate</th>
            </tr>
          </thead>

          <tbody>
            {results.map((result) => (
              <tr key={result.id}>
                <td>{result.videoTitle}</td>
                <td>{result.score}%</td>
                <td>
                  {result.correct} / {result.total}
                </td>
                <td>{result.passed ? "PASS" : "FAIL"}</td>
                <td>
                  {new Date(result.submittedAt).toLocaleString("en-IN")}
                </td>
                <td>
                  {result.passed ? (
                    <button
  className="download-btn"
  onClick={() => navigate(`/certificate/${result.id}`)}
>
                      Download
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <br />

      <button className="download-btn" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
    </div>
  );
}

export default MyResults;