import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, get, set } from "firebase/database";
import { auth, database } from "../firebase";
import "../styles/videopage.css";

function VideoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const watchedSecondsRef = useRef(new Set());
  const lastSavedRef = useRef(0);
  const resumeTimeRef = useRef(0);
  const hasResumedRef = useRef(false);

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [passedCourse, setPassedCourse] = useState(null);
  const [watchPercent, setWatchPercent] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;

      if (!user) {
        navigate("/");
        return;
      }

      const videoSnapshot = await get(ref(database, `videos/${id}`));

      if (videoSnapshot.exists()) {
        setVideo({
          id,
          ...videoSnapshot.val(),
        });
      }

      const progressSnapshot = await get(
        ref(database, `progress/${user.uid}/${id}`)
      );

      if (progressSnapshot.exists()) {
        const progressData = progressSnapshot.val();

        if (progressData.watchedSeconds) {
          watchedSecondsRef.current = new Set(
            Object.keys(progressData.watchedSeconds).map(Number)
          );
        }

        if (progressData.watchedPercent) {
          setWatchPercent(progressData.watchedPercent);
        }

        if (progressData.lastPosition) {
          resumeTimeRef.current = progressData.lastPosition;
        }

        if (progressData.completed) {
          setVideoCompleted(true);
          setWatchPercent(100);
        }
      }

      const completedSnapshot = await get(
        ref(database, `completedCourses/${user.uid}/${id}`)
      );

      if (completedSnapshot.exists()) {
        const data = completedSnapshot.val();

        if (data.passed) {
          setPassedCourse(data);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [id, navigate]);

  const saveProgress = async (percentValue, completed = false, currentTime = 0) => {
    const user = auth.currentUser;

    if (!user || !video) return;

    const watchedSecondsObject = {};

    watchedSecondsRef.current.forEach((second) => {
      watchedSecondsObject[second] = true;
    });

    await set(ref(database, `progress/${user.uid}/${video.id}`), {
      videoId: video.id,
      videoTitle: video.title,
      completed,
      watchedPercent: completed ? 100 : percentValue,
      watchedSeconds: watchedSecondsObject,
      duration: videoDuration,
      lastPosition: completed ? 0 : Math.floor(currentTime),
      updatedAt: new Date().toISOString(),
      ...(completed && {
        completedAt: new Date().toISOString(),
      }),
    });
  };

  const handleLoadedMetadata = (e) => {
    const duration = Math.floor(e.target.duration);
    setVideoDuration(duration);

    if (!hasResumedRef.current && resumeTimeRef.current > 0) {
      const safeResumeTime = Math.min(resumeTimeRef.current, duration - 2);

      if (safeResumeTime > 0) {
        e.target.currentTime = safeResumeTime;
      }

      hasResumedRef.current = true;
    }

    if (watchedSecondsRef.current.size > 0 && duration > 0) {
      const savedPercent = Math.min(
        100,
        Math.floor((watchedSecondsRef.current.size / duration) * 100)
      );

      setWatchPercent(savedPercent);
    }
  };

  const handleVideoProgress = async (e) => {
    if (videoCompleted) return;

    const currentSecond = Math.floor(e.target.currentTime);
    const duration = Math.floor(e.target.duration);

    if (!duration) return;

    watchedSecondsRef.current.add(currentSecond);

    const percent = Math.min(
      100,
      Math.floor((watchedSecondsRef.current.size / duration) * 100)
    );

    setWatchPercent(percent);

    const now = Date.now();

    if (now - lastSavedRef.current > 5000) {
      lastSavedRef.current = now;
      await saveProgress(percent, false, e.target.currentTime);
    }
  };

  const handleVideoPause = async (e) => {
    if (!videoCompleted) {
      await saveProgress(watchPercent, false, e.target.currentTime);
    }
  };

  const markVideoCompleted = async () => {
    if (!video || videoCompleted) return;

    setVideoCompleted(true);
    setWatchPercent(100);

    await saveProgress(100, true, 0);
  };

  const handleVideoEnd = async () => {
    if (!videoDuration) return;

    const actualWatchedPercent = Math.floor(
      (watchedSecondsRef.current.size / videoDuration) * 100
    );

    if (actualWatchedPercent >= 95) {
      await markVideoCompleted();
    } else {
      await saveProgress(actualWatchedPercent, false, videoDuration);
      alert("Please watch the complete video to unlock the quiz.");
    }
  };

  if (loading) {
    return <h2 className="video-status-msg">Loading Video...</h2>;
  }

  if (!video) {
    return <h1 className="video-status-msg error">Video Not Found</h1>;
  }

  return (
    <div className="video-page-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="lesson-header">
        <p className="lesson-label">Training Module</p>

        <h1>{video.title}</h1>

        <p className="lesson-description">
          Watch the full training video to unlock the quiz assessment.
        </p>
      </div>

      {passedCourse && (
        <div className="status-banner banner-passed">
          <div>
            <h3>Course Already Passed</h3>
            <p>Score: {passedCourse.score}%</p>
          </div>

          <button
            onClick={() => navigate(`/certificate/${passedCourse.attemptId}`)}
            className="btn-certificate"
          >
            Download Certificate
          </button>
        </div>
      )}

      <div className="lesson-content">
        <div className="video-wrapper">
          <video
            ref={videoRef}
            controls
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleVideoProgress}
            onPause={handleVideoPause}
            onEnded={handleVideoEnd}
            className="video-player-frame"
          >
            <source src={video.videoUrl} type="video/mp4" />
          </video>
        </div>

        {!passedCourse && (
          <div className="course-sidebar">
            <div className="info-card">
              <h3>Course Progress</h3>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${videoCompleted ? 100 : watchPercent}%`,
                  }}
                ></div>
              </div>

              <p className="progress-text">
                {videoCompleted
                  ? "100% Completed"
                  : `${watchPercent}% Watched`}
              </p>
            </div>

            {videoCompleted ? (
              <div className="quiz-card success-card">
                <h3>Quiz Unlocked</h3>

                <p>
                  You have completed the video. You can now start the quiz.
                </p>

                <button
                  onClick={() => navigate(`/quiz/${video.id}`)}
                  className="btn-quiz-action"
                >
                  Start Quiz
                </button>
              </div>
            ) : (
              <div className="quiz-card locked-card">
                <h3>Quiz Locked</h3>

                <p>
                  Watch the complete video to unlock the quiz assessment.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoPage;