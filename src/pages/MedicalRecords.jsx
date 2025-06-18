import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const MedicalRecords = ({ token }) => {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const location = useLocation();

  const [formData, setFormData] = useState({
    diagnosis: "",
    doctorNotes: "",
    medications: "",
  });

  useEffect(() => {
    if (location.state?.medicalRecord) {
      setFormData(location.state.medicalRecord);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/appointment/${appointmentId}/medical-record`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...formData, markComplete: true }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Medical record updated!");
        navigate("/appointments");
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <div className="medical-container">
      <h2 className="form-title">Medical Record</h2>
      <form className="medical-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="diagnosis">Diagnosis:</label>
          <input
            type="text"
            id="diagnosis"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            placeholder="Enter diagnosis"
          />
        </div>

        <div className="form-row">
          <label htmlFor="doctorNotes">Doctor Notes:</label>
          <textarea
            id="doctorNotes"
            name="doctorNotes"
            rows="4"
            value={formData.doctorNotes}
            onChange={handleChange}
            placeholder="Enter doctor notes"
          />
        </div>

        <div className="form-row">
          <label htmlFor="medications">Medications:</label>
          <input
            type="text"
            id="medications"
            name="medications"
            value={formData.medications}
            onChange={handleChange}
            placeholder="Enter medications"
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
