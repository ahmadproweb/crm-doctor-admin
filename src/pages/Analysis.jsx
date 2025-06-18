import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { secureFetch } from "../pages/api";

const Analysis = ({ role }) => {
  const { state } = useLocation();
  const [patient, setPatient] = useState(state?.patient || null);
  const [loading, setLoading] = useState(!state?.patient);

  useEffect(() => {
    if (patient) return;

    const apiRoute =
      role === "doctor"
        ? "http://localhost:2642/api/doctor/patients"
        : "http://localhost:2642/api/admin/patients";

    const fetchOne = async () => {
      try {
        const all = await secureFetch(apiRoute);
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("id");
        const found = all.find((p) => String(p.id) === id);
        setPatient(found || null);
      } catch (e) {
        console.error("fetch error", e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOne();
  }, [patient, role]);

  if (loading) return <div className="analysis-loading">Loading...</div>;
  if (!patient) return <div className="analysis-error">Patient not found</div>;

  return (
    <div className="analysis-container">
      <h2 className="analysis-heading">
        Analysis for <span>{patient.fullName}</span>
      </h2>

      {patient.Analyses?.length ? (
        <div className="analysis-grid">
          {patient.Analyses.map((a, i) => (
            <div key={i} className="analysis-card">
              <div className="data">
                <h4>{a.analysisName} </h4>
                <a href={a.pdfPath} download className="download-link">
                  Download PDF
                </a>

              </div>
              {a.pdfPath?.endsWith(".pdf") && (
                <div className="pdf-viewer">
                  <iframe
                    src={a.pdfPath}
                    title={`PDF_${i}`}
                    frameBorder="0"
                    className="pdf-frame"
                  />

                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="no-analysis">No analysis records found.</p>
      )}
    </div>
  );
};

export default Analysis;
