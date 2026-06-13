import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Added useNavigate for dashboard navigation
import { ref, get } from "firebase/database";
import { database } from "../firebase";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../styles/certificatepage.css"; // Imported professional certificate stylesheet

function CertificatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const certificateRef = useRef(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      const snapshot = await get(ref(database, `attempts/${id}`));

      if (snapshot.exists()) {
        setResult(snapshot.val());
      }
    };

    fetchResult();
  }, [id]);

  const downloadCertificate = async () => {
    const canvas = await html2canvas(certificateRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("landscape", "px", [1600, 1100]);
    pdf.addImage(imgData, "PNG", 0, 0, 1600, 1100);
    pdf.save(`${result.userName || "certificate"}.pdf`);
  };

  if (!result) return <h2 className="cert-status-msg">Loading Certificate...</h2>;

  const date = new Date(result.submittedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const certificateId = `CERT-${id.slice(-10)}`;

  return (
    <div className="cert-page-container">
      <div className="cert-header-actions">
        <div>
          <h1 className="cert-main-title">Certificate Ready</h1>
          <p className="cert-subtitle">Your achievement certificate has been generated successfully.</p>
        </div>
        <button onClick={() => navigate("/dashboard")} className="btn-cert-secondary">
          Back to Dashboard
        </button>
      </div>

      {/* Frame Preview Wrapper to handle scale offset artifacting */}
      <div className="cert-canvas-preview-frame">
        <div
          ref={certificateRef}
          className="cert-canvas-element"
          style={{
            width: "1600px",
            height: "1100px",
            position: "relative",
            backgroundImage: "url('/certificate/certificate.png')",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            margin: "0 auto",
            transform: "scale(0.55)",
            transformOrigin: "top center",
          }}
        >
          {/* User Name - Absolute Positioning coordinates preserved for html2canvas tracking */}
          <div
            style={{
              position: "absolute",
              top: "480px",
              left: "0",
              width: "100%",
              textAlign: "center",
              fontSize: "72px",
              fontFamily: "'Times New Roman', serif",
              fontWeight: "600",
              color: "#101828",
              textTransform: "capitalize",
              lineHeight: "1",
            }}
          >
            {result.userName || "Student Name"}
          </div>

          {/* Course Name - Absolute Positioning coordinates preserved for html2canvas tracking */}
          <div
            style={{
              position: "absolute",
              top: "640px",
              left: "0",
              width: "100%",
              textAlign: "center",
              fontSize: "30px",
              fontFamily: "'Times New Roman', serif",
              fontWeight: "600",
              color: "#101828",
              lineHeight: "1.2",
            }}
          >
            {result.videoTitle || "Training Course"}
          </div>

          {/* Date - Absolute Positioning coordinates preserved for html2canvas tracking */}
          <div
            style={{
              position: "absolute",
              top: "825px",
              left: "520px",
              fontSize: "24px",
              fontFamily: "Arial, sans-serif",
              color: "#101828",
              lineHeight: "1",
            }}
          >
            {date}
          </div>

          {/* Certificate ID - Absolute Positioning coordinates preserved for html2canvas tracking */}
          <div
            style={{
              position: "absolute",
              top: "825px",
              left: "1090px",
              fontSize: "22px",
              fontFamily: "Arial, sans-serif",
              color: "#101828",
              lineHeight: "1",
            }}
          >
            {certificateId}
          </div>
        </div>
      </div>

      <div className="cert-trigger-footer">
        <button onClick={downloadCertificate} className="btn-cert-primary">
          Download High-Res PDF
        </button>
      </div>
    </div>
  );
}

export default CertificatePage;