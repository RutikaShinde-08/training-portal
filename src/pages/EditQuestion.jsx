import { useEffect, useState } from "react";
import { ref, get, update } from "firebase/database";
import { database } from "../firebase";
import { useNavigate, useParams, Link } from "react-router-dom"; // Added Link for navigation safety
import "../styles/addquestion.css"; // Sharing identical high-grade styles with the question creator

function EditQuestion() {
  const { videoId, questionId } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      const snapshot = await get(
        ref(database, `questions/${videoId}/${questionId}`)
      );

      if (snapshot.exists()) {
        const data = snapshot.val();

        setQuestion(data.question || "");
        setOptionA(data.options?.[0] || "");
        setOptionB(data.options?.[1] || "");
        setOptionC(data.options?.[2] || "");
        setOptionD(data.options?.[3] || "");
        setCorrectAnswer(data.correctAnswer || "");
      }

      setLoading(false);
    };

    fetchQuestion();
  }, [videoId, questionId]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const options = [optionA, optionB, optionC, optionD];

    if (!options.includes(correctAnswer)) {
      alert("Correct answer must match one of the options.");
      return;
    }

    await update(ref(database, `questions/${videoId}/${questionId}`), {
      question,
      options,
      correctAnswer,
      updatedAt: new Date().toISOString(),
    });

    alert("Question Updated Successfully");
    navigate("/admin/questions");
  };

  if (loading) return <h2 className="admin-status-msg">Loading Question...</h2>;

  return (
    <div className="admin-question-container">
      {/* Navigation Return contextual framework */}
      <div className="admin-nav-back-row">
        <Link to="/admin/questions" className="btn-admin-back">
          ← Cancel and Return to Pools
        </Link>
      </div>

      <div className="admin-question-card">
        <h1 className="admin-question-title">Edit Assessment Question</h1>
        <p className="admin-question-subtitle">Modify evaluation phrasing, individual variables, or update the active answer key.</p>

        <form onSubmit={handleUpdate} className="admin-core-form">
          <div className="admin-input-group">
            <label className="admin-field-label">Question Text</label>
            <textarea
              placeholder="Enter Question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="admin-form-textarea"
              rows="3"
              required
            />
          </div>

          {/* Multiple Choice Options Grouping Block */}
          <div className="admin-options-card">
            <h3 className="options-group-title">Configure Multiple Choice Answers</h3>
            
            <div className="options-input-grid">
              <div className="admin-input-group">
                <label className="admin-field-label choice-indicator text-a">Option A</label>
                <input
                  placeholder="Option A"
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  className="admin-form-input"
                  required
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-field-label choice-indicator text-b">Option B</label>
                <input
                  placeholder="Option B"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  className="admin-form-input"
                  required
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-field-label choice-indicator text-c">Option C</label>
                <input
                  placeholder="Option C"
                  value={optionC}
                  onChange={(e) => setOptionC(e.target.value)}
                  className="admin-form-input"
                  required
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-field-label choice-indicator text-d">Option D</label>
                <input
                  placeholder="Option D"
                  value={optionD}
                  onChange={(e) => setOptionD(e.target.value)}
                  className="admin-form-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="admin-input-group highlight-selection-zone">
            <label className="admin-field-label core-key-label">Designate Correct Answer Key</label>
            <select
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="admin-form-select key-selector"
              required
            >
              <option value="">Select Correct Answer</option>
              {optionA && <option value={optionA}>Option A: {optionA}</option>}
              {optionB && <option value={optionB}>Option B: {optionB}</option>}
              {optionC && <option value={optionC}>Option C: {optionC}</option>}
              {optionD && <option value={optionD}>Option D: {optionD}</option>}
            </select>
          </div>

          <div className="admin-form-submit-zone">
            <button type="submit" className="btn-admin-submit-form">
              Save Revision Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditQuestion;