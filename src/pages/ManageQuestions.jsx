import { useEffect, useState } from "react";
import { ref, get, remove } from "firebase/database";
import { database } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import "../styles/managequestions.css"; // Imported professional dynamic workspace stylesheet

function ManageQuestions() {
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const snapshot = await get(ref(database, "videos"));

    if (snapshot.exists()) {
      const data = snapshot.val();

      const videoArray = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));

      setVideos(videoArray);
    }
  };

  const fetchQuestions = async (videoId) => {
    if (!videoId) {
      setQuestions([]);
      return;
    }

    const snapshot = await get(ref(database, `questions/${videoId}`));

    if (snapshot.exists()) {
      const data = snapshot.val();

      const questionArray = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));

      setQuestions(questionArray);
    } else {
      setQuestions([]);
    }
  };

  const handleDelete = async (questionId) => {
    const confirmDelete = window.confirm("Are you absolute certain you want to delete this evaluation item? This choice can't be undone.");
    if (!confirmDelete) return;

    await remove(ref(database, `questions/${selectedVideo}/${questionId}`));

    fetchQuestions(selectedVideo);
  };

  return (
    <div className="manage-questions-container">
      {/* Top Controls Header Workspace Layout */}
      <div className="q-header-row">
        <div>
          <div className="back-link-wrapper">
            <Link to="/admin" className="btn-q-back">← Admin Dashboard</Link>
          </div>
          <h1 className="q-main-title">Manage Question Pools</h1>
          <p className="q-subtitle">Filter assessment databases by active modules, alter option arrays, or edit answers.</p>
        </div>
        <Link to="/admin/add-question" className="btn-q-create-new">
          + Add New Question
        </Link>
      </div>

      {/* Target Module Filtering Controls Bar Container */}
      <div className="filter-selection-card">
        <label className="filter-select-label">Select Course Filter:</label>
        <div className="select-dropdown-wrapper">
          <select
            value={selectedVideo}
            onChange={(e) => {
              setSelectedVideo(e.target.value);
              fetchQuestions(e.target.value);
            }}
            className="admin-filter-select"
          >
            <option value="">-- Choose Training Module Catalog --</option>
            {videos.map((video) => (
              <option key={video.id} value={video.id}>
                {video.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Pool Evaluation Listing Workspace Layout */}
      <div className="questions-render-workspace">
        {!selectedVideo ? (
          <div className="workspace-status-card info-prompt">
            <h3>No Course Selected</h3>
            <p>Please select an active training module from the filter dropdown menu above to view its evaluation question pool.</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="workspace-status-card zero-data-prompt">
            <h3>Empty Question Pool</h3>
            <p>No questions have been attached to this course yet. Click "+ Add New Question" above to seed your database.</p>
          </div>
        ) : (
          <div className="questions-data-list">
            <div className="pool-count-indicator">
              Showing <strong>{questions.length}</strong> evaluation questions assigned to this course.
            </div>

            {questions.map((question, index) => (
              <div key={question.id} className="question-item-card">
                <div className="q-card-upper-row">
                  <span className="q-index-badge">Item #{index + 1}</span>
                  <div className="q-card-actions-row">
                    <button
                      onClick={() =>
                        navigate(`/admin/edit-question/${selectedVideo}/${question.id}`)
                      }
                      className="btn-item-action-edit"
                    >
                      Edit Question
                    </button>
                    <button 
                      onClick={() => handleDelete(question.id)} 
                      className="btn-item-action-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <h3 className="q-card-body-text">{question.question}</h3>

                {/* Styled Grid Selection Parameters Options Mapping Layout */}
                <div className="q-card-options-matrix">
                  {question.options?.map((option, idx) => {
                    const isCorrect = option === question.correctAnswer;
                    return (
                      <div 
                        key={option} 
                        className={`q-option-pill-display ${isCorrect ? "valid-target-key" : ""}`}
                      >
                        <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                        <span className="option-string">{option}</span>
                        {isCorrect && <span className="key-checkmark-tag">✓ Correct Key</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageQuestions;