import { useEffect, useState } from "react";
import { ref, get, update } from "firebase/database";
import { database } from "../firebase";
import { useNavigate, useParams, Link } from "react-router-dom"; 
import "../styles/addvideo.css"; 

function EditVideo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Track just the video name/slug rather than the full URL path
  const [videoSlug, setVideoSlug] = useState("");
  
  const [passingScore, setPassingScore] = useState(70);
  const [testDuration, setTestDuration] = useState(60);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      const snapshot = await get(ref(database, `videos/${id}`));

      if (snapshot.exists()) {
        const video = snapshot.val();

        setTitle(video.title || "");
        setDescription(video.description || "");
        
        // Strip out the "/videos/" prefix from the DB value for clean field rendering
        const dbUrl = video.videoUrl || "";
        const extractedSlug = dbUrl.replace(/^\/videos\//, "");
        setVideoSlug(extractedSlug);
        
        setPassingScore(video.passingScore || 70);
        setTestDuration(video.testDuration || 60);
      }

      setLoading(false);
    };

    fetchVideo();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Clean up input: remove accidental leading or trailing slashes
    const cleanSlug = videoSlug.replace(/^\/+|\/+$/g, "");
    
    // Auto-assemble the uniform absolute path string
    const finalVideoUrl = `/videos/${cleanSlug}`;

    try {
      await update(ref(database, `videos/${id}`), {
        title,
        description,
        videoUrl: finalVideoUrl, // Saves the absolute uniform route structure back to Firebase
        passingScore: Number(passingScore),
        testDuration: Number(testDuration),
        updatedAt: new Date().toISOString(),
      });

      alert("Video Updated Successfully");
      navigate("/admin/videos");
    } catch (error) {
      console.error(error);
      alert("Failed to update video parameters");
    }
  };

  if (loading) return <h2 className="admin-status-msg">Loading Video Details...</h2>;

  return (
    <div className="admin-form-container">
      <div className="admin-nav-back-row">
        <Link to="/admin/videos" className="btn-admin-back">
          ← Cancel and Return to Catalog
        </Link>
      </div>

      <div className="admin-form-card">
        <h1 className="admin-form-title">Edit Video Course</h1>
        <p className="admin-form-subtitle">Update core training metadata and modify examination pass parameters.</p>

        <form onSubmit={handleUpdate} className="admin-core-form">
          <div className="admin-input-group">
            <label className="admin-field-label">Course Module Title</label>
            <input
              placeholder="Video Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="admin-form-input"
              required
            />
          </div>

          <div className="admin-input-group">
            <label className="admin-field-label">Course Description Summary</label>
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="admin-form-textarea"
              rows="4"
              required
            />
          </div>

          {/* Locked Content Input Field Wrapper Layout */}
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
              Modifying this path? Type the filename only. Target structure output: <strong>/videos/{videoSlug || "..."}</strong>
            </small>
          </div>

          {/* Double-Column Metric Alignment Layout Grid rule */}
          <div className="admin-form-row-split">
            <div className="admin-input-group">
              <label className="admin-field-label">Passing Benchmark (%)</label>
              <input
                type="number"
                placeholder="Passing Score"
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
                placeholder="Quiz Duration"
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
              Apply Changes & Update Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditVideo;