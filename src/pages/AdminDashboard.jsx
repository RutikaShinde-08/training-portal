import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { signOut } from "firebase/auth";
import { database, auth } from "../firebase";
import "../styles/admindashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    questions: 0,
    attempts: 0,
    passRate: 0,
    certificates: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const usersSnap = await get(ref(database, "users"));
      const videosSnap = await get(ref(database, "videos"));
      const questionsSnap = await get(ref(database, "questions"));
      const attemptsSnap = await get(ref(database, "attempts"));

      const users = usersSnap.exists()
        ? Object.keys(usersSnap.val()).length
        : 0;

      const courses = videosSnap.exists()
        ? Object.keys(videosSnap.val()).length
        : 0;

      let questions = 0;

      if (questionsSnap.exists()) {
        const qData = questionsSnap.val();

        Object.keys(qData).forEach((videoId) => {
          questions += Object.keys(qData[videoId]).length;
        });
      }

      let attempts = 0;
      let passedAttempts = 0;

      if (attemptsSnap.exists()) {
        const attemptsArray = Object.values(attemptsSnap.val());

        attempts = attemptsArray.length;
        passedAttempts = attemptsArray.filter((a) => a.passed).length;
      }

      const passRate =
        attempts > 0 ? Math.round((passedAttempts / attempts) * 100) : 0;

      setStats({
        users,
        courses,
        questions,
        attempts,
        passRate,
        certificates: passedAttempts,
      });
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout from admin panel?"
    );

    if (!confirmLogout) return;

    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Failed to logout. Please try again.");
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header-row">
      

        <div className="admin-header-content">
          <h1 className="admin-main-title">
            Admin Management Workspace
          </h1>

          <p className="admin-subtitle">
            Monitor platform analytics, manage training content, and configure
            assessment pools.
          </p>
        </div>

        <div className="admin-header-nav-group">
          <Link to="/dashboard" className="link-user-portal">
            Go to User Dashboard →
          </Link>

          <button onClick={handleLogout} className="btn-dashboard-logout">
            Log Out Securely
          </button>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card stat-blue">
     
          <div>
            <span className="admin-card-label">Total Registered Users</span>
            <h2 className="admin-card-value">{stats.users}</h2>
          </div>
        </div>

        <div className="admin-stat-card stat-green">
    
          <div>
            <span className="admin-card-label">Active Training Courses</span>
            <h2 className="admin-card-value">{stats.courses}</h2>
          </div>
        </div>

        <div className="admin-stat-card stat-purple">
         
          <div>
            <span className="admin-card-label">Total Evaluation Questions</span>
            <h2 className="admin-card-value">{stats.questions}</h2>
          </div>
        </div>

        <div className="admin-stat-card stat-orange">
        
          <div>
            <span className="admin-card-label">Total Exam Attempts</span>
            <h2 className="admin-card-value">{stats.attempts}</h2>
          </div>
        </div>

        <div className="admin-stat-card stat-success highlighted-metric">
         
          <div>
            <span className="admin-card-label">Passing Success Rate</span>
            <h2 className="admin-card-value">{stats.passRate}%</h2>
          </div>
        </div>

        <div className="admin-stat-card stat-red">
       
          <div>
            <span className="admin-card-label">Certificates Issued</span>
            <h2 className="admin-card-value">{stats.certificates}</h2>
          </div>
        </div>
      </div>

      <div className="admin-operations-panel">
        <div className="admin-section-header">
          <p className="admin-section-kicker">Quick Actions</p>
          <h2 className="admin-section-heading">
            Quick Management Operations
          </h2>
          <p className="admin-section-subtitle">
            Manage your platform content and assessments from one place.
          </p>
        </div>

        <div className="admin-actions-grid">
          <Link to="/admin/add-question" className="admin-action-link">
            <div className="btn-admin-action action-question-create">
              <div className="action-icon">+</div>
              <div>
                <h3>Add New Quiz Questions</h3>
                <p>Create questions manually or upload using Excel.</p>
              </div>
              <span className="action-arrow">→</span>
            </div>
          </Link>

          <Link to="/admin/add-video" className="admin-action-link">
            <div className="btn-admin-action action-video-create">
              <div className="action-icon">▶</div>
              <div>
                <h3>Add New Video Course</h3>
                <p>Upload and configure a new training module.</p>
              </div>
              <span className="action-arrow">→</span>
            </div>
          </Link>

          <Link to="/admin/questions" className="admin-action-link">
            <div className="btn-admin-action action-question-manage">
              <div className="action-icon">Q</div>
              <div>
                <h3>Manage Question Pools</h3>
                <p>View, edit, and organize assessment questions.</p>
              </div>
              <span className="action-arrow">→</span>
            </div>
          </Link>

          <Link to="/admin/videos" className="admin-action-link">
            <div className="btn-admin-action action-video-manage">
              <div className="action-icon">V</div>
              <div>
                <h3>Manage Video Catalog</h3>
                <p>Maintain your video library and course catalog.</p>
              </div>
              <span className="action-arrow">→</span>
            </div>
          </Link>

          <Link
            to="/admin/results"
            className="admin-action-link full-width-action"
          >
            <div className="btn-admin-action action-inspect">
              <div className="action-icon">LOG</div>
              <div>
                <h3>Review Employee Results Log</h3>
                <p>Track attempts, scores, certificates, and performance.</p>
              </div>
              <span className="action-arrow">→</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;