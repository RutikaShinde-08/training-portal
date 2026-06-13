import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, database } from "../firebase";
import { ref, get, set } from "firebase/database";
import "../styles/quizpage.css"; // Imported the professional quiz workspace stylesheet

function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizData = async () => {
      const user = auth.currentUser;

      if (user) {
        const completedSnapshot = await get(
          ref(database, `completedCourses/${user.uid}/${id}`)
        );

        if (completedSnapshot.exists()) {
          const completedData = completedSnapshot.val();

          if (completedData.passed && completedData.attemptId) {
            navigate(`/certificate/${completedData.attemptId}`);
            return;
          }
        }
      }

      const videoSnapshot = await get(ref(database, `videos/${id}`));

      if (videoSnapshot.exists()) {
        const videoData = {
          id,
          ...videoSnapshot.val(),
        };

        setVideo(videoData);
        setTimeLeft(videoData.testDuration || 60);
      }

      const questionsSnapshot = await get(ref(database, `questions/${id}`));

      if (questionsSnapshot.exists()) {
        const data = questionsSnapshot.val();

        const questionArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        setQuizQuestions(questionArray);
      }

      setLoading(false);
    };

    fetchQuizData();
  }, [id, navigate]);

  const submitQuiz = async () => {
    if (submitted || !video) return;

    setSubmitted(true);

    let correct = 0;

    quizQuestions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const total = quizQuestions.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = score >= video.passingScore;

    const user = auth.currentUser;
    const attemptId = `${user.uid}_${id}_${Date.now()}`;

    await set(ref(database, `attempts/${attemptId}`), {
      userId: user.uid,
      userName: user.displayName,
      videoId: id,
      videoTitle: video.title,
      score,
      total,
      correct,
      passed,
      submittedAt: new Date().toISOString(),
    });

    await set(ref(database, `completedCourses/${user.uid}/${id}`), {
      videoId: id,
      videoTitle: video.title,
      passed,
      score,
      attemptId,
      completedAt: new Date().toISOString(),
    });

    navigate(`/result/${attemptId}`);
  };

  useEffect(() => {
    if (loading || submitted || !video) return;

    if (timeLeft <= 0) {
      submitQuiz();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, submitted, loading, video]);

  if (loading) {
    return <h2 className="quiz-status-msg">Loading Quiz...</h2>;
  }

  if (!video) {
    return <h1 className="quiz-status-msg error">Video not found</h1>;
  }

  if (quizQuestions.length === 0) {
    return (
      <div className="quiz-page-container fallback-view">
        <h1 className="quiz-main-title">{video.title} Quiz</h1>
        <p className="no-questions-msg">No questions added for this video yet.</p>
        <button onClick={() => navigate("/dashboard")} className="btn-quiz-fallback">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-page-container">
      <div className="quiz-sticky-header">
        <h1 className="quiz-main-title">{video.title} Quiz</h1>
        <div className={`quiz-timer-badge ${timeLeft <= 15 ? "timer-warning" : ""}`}>
          Time Left: <span>{timeLeft}s</span>
        </div>
      </div>

      <div className="quiz-questions-list">
        {quizQuestions.map((q, index) => (
          <div key={q.id} className="quiz-question-card">
            <h3 className="quiz-question-text">
              <span className="question-number">{index + 1}.</span> {q.question}
            </h3>

            <div className="quiz-options-group">
              {q.options.map((option) => {
                const isSelected = answers[q.id] === option;
                return (
                  <label key={option} className={`quiz-option-row ${isSelected ? "option-checked" : ""}`}>
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={option}
                      checked={isSelected}
                      onChange={() =>
                        setAnswers({
                          ...answers,
                          [q.id]: option,
                        })
                      }
                      className="quiz-radio-input"
                    />
                    <span className="option-text">{option}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="quiz-submission-zone">
        <button onClick={submitQuiz} className="btn-quiz-submit">
          Submit Quiz
        </button>
      </div>
    </div>
  );
}

export default QuizPage;