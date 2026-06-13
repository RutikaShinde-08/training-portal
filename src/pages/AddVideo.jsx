import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate to redirect after creation
import { push, ref } from "firebase/database";
import { database } from "../firebase";
import "../styles/addvideo.css"; 

function AddVideo() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Track just the video name/slug instead of the full URL route
  const [videoSlug, setVideoSlug] = useState("");
  
  const [passingScore, setPassingScore] = useState(70);
  const [testDuration, setTestDuration] = useState(60);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clean up input: remove leading or trailing slashes if typed by mistake
    const cleanSlug = videoSlug.replace(/^\/+|\/+$/g, "");
    
    // Auto-assemble the complete path string
    const finalVideoUrl = `/videos/${cleanSlug}`;

    try {
      await push(ref(database, "videos"), {
        title,
        description,
        videoUrl: finalVideoUrl, // Saves clean complete location route to Firebase
        passingScore: Number(passingScore),
        testDuration: Number(testDuration),
        createdAt: new Date().toISOString(),
      });

      alert("Video Added Successfully");
      
      // Navigate to the video directory layout to view your new addition
      navigate("/admin/videos");

    } catch (error) {
      console.error(error);
      alert("Failed to add video");
    }
  };

  return (
    <div className="admin-form-container">
      <div className="admin-nav-back-row">
        <Link to="/admin" className="btn-admin-back">
          ← Back to Admin Console
        </Link>
      </div>

      <div className="admin-form-card">
        <h1 className="admin-form-title">Add New Video Course</h1>
        <p className="admin-form-subtitle">Deploy a structural training module asset with associated exam parameters.</p>

        <form onSubmit={handleSubmit} className="admin-core-form">
          <div className="admin-input-group">
            <label className="admin-field-label">Course Module Title</label>
            <input
              placeholder="e.g., Introduction to Cyber Security Protocol"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="admin-form-input"
              required
            />
          </div>

          <div className="admin-input-group">
            <label className="admin-field-label">Course Description Summary</label>
            <textarea
              placeholder="Provide context and summary goals for the training material..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="admin-form-textarea"
              rows="4"
              required
            />
          </div>

          {/* Video Routing Input Block with Fixed prefix UI elements */}
          <div className="admin-input-group">
            <label className="admin-field-label">Video Content File Name / Slug</label>
            <div className="prefix-input-wrapper">
              <span className="route-fixed-prefix">/videos/</span>
              <input
                placeholder="training1.mp4"
                value={videoSlug}
                onChange={(e) => setVideoSlug(e.target.value)}
                className="admin-form-input source-code-font prefix-attached"
                required
              />
            </div>
            <small className="field-hint-text">
              Type the filename only. Saved output string: <strong>/videos/{videoSlug || "..."}</strong>
            </small>
          </div>

          {/* Metrics configuration section grouped as two columns */}
          <div className="admin-form-row-split">
            <div className="admin-input-group">
              <label className="admin-field-label">Passing Benchmark (%)</label>
              <input
                type="number"
                placeholder="70"
                min="0"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                className="admin-form-input"
                required
              />
            </div>

            <div className="admin-input-group">
              <label className="admin-field-label">Exam Timer Limit (Seconds)</label>
              <input
                type="number"
                placeholder="60"
                min="5"
                value={testDuration}
                onChange={(e) => setTestDuration(e.target.value)}
                className="admin-form-input"
                required
              />
            </div>
          </div>

          <div className="admin-form-submit-zone">
            <button type="submit" className="btn-admin-submit-form">
              Save Video Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddVideo;