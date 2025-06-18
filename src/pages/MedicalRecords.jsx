// MedicalRecords.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const MedicalRecords = () => {
  const navigate           = useNavigate();
  const { appointmentId }  = useParams();
  const { state }          = useLocation();   // comes from Appointments “Medical record” btn

  /* ------------ local state ------------ */
  const [formData, setFormData] = useState({
    diagnosis   : "",
    doctorNotes : "",
    medications : "",
  });

  /* ------------ preload if record exists ------------ */
  useEffect(() => {
    if (state?.medicalRecord) {
      setFormData(state.medicalRecord);
    }
  }, [state]);

  /* ------------ handlers ------------ */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSaveDraft = () => {
  if (!formData.diagnosis || !formData.doctorNotes || !formData.medications) {
    toast.error("Please fill all fields before saving");
    return;
  }

  // Save in localStorage instead of location.state
  localStorage.setItem(
    `draftRecord-${appointmentId}`,
    JSON.stringify(formData)
  );

  toast.success("Draft saved – click the tick ✔ to submit");

  navigate("/appointments");
};


  return (
    <div className="medical-container">
      <h2 className="form-title">Medical Record</h2>

      <form
        className="medical-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSaveDraft();
        }}
      >
        <div className="form-row">
          <label htmlFor="diagnosis">Diagnosis</label>
          <input
            id="diagnosis"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            placeholder="Enter diagnosis"
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="doctorNotes">Doctor Notes</label>
          <textarea
            id="doctorNotes"
            name="doctorNotes"
            rows="4"
            value={formData.doctorNotes}
            onChange={handleChange}
            placeholder="Enter notes"
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="medications">Medications</label>
          <input
            id="medications"
            name="medications"
            value={formData.medications}
            onChange={handleChange}
            placeholder="Enter medications"
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          Submit
        </button>
      </form>
    </div>
  );
};

export default MedicalRecords;
