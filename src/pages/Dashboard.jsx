import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, database } from "../firebase";
import "../styles/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [progress, setProgress] = useState({});
  const [completedCourses, setCompletedCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("new");

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;

      if (!user) {
        navigate("/");
        return;
      }

      const videosSnapshot = await get(ref(database, "videos"));

      if (videosSnapshot.exists()) {
        const data = videosSnapshot.val();

        const videoArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        setVideos(videoArray);
      }

      const progressSnapshot = await get(ref(database, `progress/${user.uid}`));

      if (progressSnapshot.exists()) {
        setProgress(progressSnapshot.val());
      }

      const completedSnapshot = await get(
        ref(database, `completedCourses/${user.uid}`)
      );

      if (completedSnapshot.exists()) {
        setCompletedCourses(completedSnapshot.val());
      }

      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const getCourseData = (video) => {
    const videoProgress = progress?.[video.id] || {};
    const courseData = completedCourses?.[video.id] || {};

    const watchedPercent = videoProgress?.watchedPercent || 0;
    const videoCompleted = videoProgress?.completed || false;
    const hasPassed = courseData?.passed || false;
    const attemptId = courseData?.attemptId;

    return {
      watchedPercent,
      videoCompleted,
      hasPassed,
      attemptId,
    };
  };

  const getCourseStatus = (video) => {
    const { watchedPercent, videoCompleted, hasPassed } = getCourseData(video);

    if (hasPassed) return "completed";
    if (videoCompleted || watchedPercent > 0) return "inProgress";
    return "incomplete";
  };

  const completedCoursesList = videos.filter(
    (video) => getCourseStatus(video) === "completed"
  );

  const incompleteCoursesList = videos.filter(
    (video) => getCourseStatus(video) === "incomplete"
  );

  const inProgressCoursesList = videos.filter(
    (video) => getCourseStatus(video) === "inProgress"
  );

  const continueLearningCourses = videos.filter((video) => {
    const { watchedPercent, videoCompleted, hasPassed } = getCourseData(video);
    return !hasPassed && (watchedPercent > 0 || videoCompleted);
  });

  const filteredCourses =
    activeFilter === "completed"
      ? completedCoursesList
      : activeFilter === "incomplete"
      ? incompleteCoursesList
      : activeFilter === "inProgress"
      ? inProgressCoursesList
      : videos;

  const filterTitle =
    activeFilter === "completed"
      ? "Completed Courses"
      : activeFilter === "incomplete"
      ? "Incomplete Courses"
      : activeFilter === "inProgress"
      ? "In Progress Courses"
      : "New Courses";

  const renderCourseCard = (video) => {
    const { watchedPercent, videoCompleted, hasPassed, attemptId } =
      getCourseData(video);

    return (
      <div key={video.id} className="course-card">
        <div className="course-thumbnail">
          <video src={video.videoUrl} preload="metadata" muted />
        </div>

        <div className="course-content">
          <div className="course-top">
            <span className="course-tag">Training Module</span>

            {hasPassed ? (
              <span className="course-status passed">Completed</span>
            ) : videoCompleted ? (
              <span className="course-status unlocked">Quiz Unlocked</span>
            ) : watchedPercent > 0 ? (
              <span className="course-status pending">In Progress</span>
            ) : (
              <span className="course-status pending">New Course</span>
            )}
          </div>

          <h2>{video.title}</h2>

          <p className="course-desc">
            {video.description ||
              "Complete this training module to unlock the assessment."}
          </p>

          <div className="course-progress">
            <div className="progress-info">
              <span>Video Progress</span>
              <strong>
                {hasPassed || videoCompleted ? "100%" : `${watchedPercent}%`}
              </strong>
            </div>

            <div className="course-progress-bar">
              <div
                className="course-progress-fill"
                style={{
                  width: `${
                    hasPassed || videoCompleted ? 100 : watchedPercent
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div className="course-actions">
            <Link to={`/video/${video.id}`}>
              <button className="btn-action">
                {hasPassed || videoCompleted
                  ? "Watch Again"
                  : watchedPercent > 0
                  ? "Continue Training"
                  : "Start Training"}
              </button>
            </Link>

            {hasPassed ? (
              <button
                onClick={() => navigate(`/certificate/${attemptId}`)}
                className="btn-outline"
              >
                Certificate
              </button>
            ) : videoCompleted ? (
              <Link to={`/quiz/${video.id}`}>
                <button className="btn-outline">Start Quiz</button>
              </Link>
            ) : null}
          </div>

          {hasPassed && (
            <p className="course-note">
              Quiz already completed. You can watch the video again, but the
              quiz cannot be attempted again.
            </p>
          )}
        </div>
      </div>
    );
  };

  const CourseSection = ({ title, courses }) => (
    <div className="course-section">
      <h2 className="section-title">{title}</h2>

      {courses.length === 0 ? (
        <p className="no-data-msg">No courses found.</p>
      ) : (
        <div className="horizontal-course-row">
          {courses.map((video) => renderCourseCard(video))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return <h2 className="dashboard-loading">Loading Dashboard...</h2>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <h1>Training Dashboard</h1>
          <h3>Welcome, {auth.currentUser?.displayName || "User"}</h3>
        </div>

        <div className="dashboard-actions">
          <button
            onClick={() => navigate("/my-results")}
            className="btn-secondary"
          >
            My Results
          </button>

          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      {videos.length === 0 ? (
        <p className="no-data-msg">No training videos available.</p>
      ) : (
        <>
          <div className="floating-filter-wrapper">
            <button
              className={activeFilter === "new" ? "active-filter" : ""}
              onClick={() => setActiveFilter("new")}
            >
              New Courses
            </button>

            <button
              className={activeFilter === "completed" ? "active-filter" : ""}
              onClick={() => setActiveFilter("completed")}
            >
              Completed
            </button>

            <button
              className={activeFilter === "incomplete" ? "active-filter" : ""}
              onClick={() => setActiveFilter("incomplete")}
            >
              Incomplete
            </button>

            <button
              className={activeFilter === "inProgress" ? "active-filter" : ""}
              onClick={() => setActiveFilter("inProgress")}
            >
              In Progress
            </button>
          </div>

          <CourseSection title={filterTitle} courses={filteredCourses} />

          <CourseSection
            title="Continue Learning"
            courses={continueLearningCourses}
          />
        </>
      )}
    </div>
  );
}

export default Dashboard;