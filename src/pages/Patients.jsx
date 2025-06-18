import { useEffect, useState } from "react";
import { BsDatabaseExclamation } from "react-icons/bs";
import { IoMdAddCircleOutline } from "react-icons/io";
import { secureFetch } from "./api";
import AddAnalysisModal from "../components/AddAnalysisModal";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { CiSearch } from "react-icons/ci";

const Patients = ({ role }) => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [modalPatient, setModalPatient] = useState(null);
  const navigate = useNavigate();

  const apiRoute =
    role === "doctor"
      ? "http://localhost:2642/api/doctor/patients"
      : "http://localhost:2642/api/admin/patients";

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await secureFetch(apiRoute);
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [apiRoute]);

  if (loading) return <Loading />;
  const filteredPatients = patients.filter((p) =>
    `${p.fullName} ${p.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="patients-container">
      <h3 className="title">Total Patients : {patients.length}</h3>
      <div className="search">
        <input
          type="search"
          placeholder="Enter Name | Email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <CiSearch className="search-icon" />
      </div>

      <div className="profile-container">
           {filteredPatients.length === 0 ? (
          <span className="error">No Patients available.</span>
        ) : (

        Array.isArray(filteredPatients) &&
          filteredPatients.map((patient) => (
            <div className="profile-card" key={patient.id}>
              <div className="avatar">
                <img src={patient.image || "/avatar.png"} alt="User Avatar" />
              </div>
              <h2 className="user-name">{patient.fullName}</h2>
              <div className="contact-info">
                <p>
                  <strong>Email:</strong> <a>{patient.email}</a>
                </p>
                <p>
                  <strong>Phone:</strong> <a>{patient.phone || "N/A"}</a>
                </p>
                <p>
                  <strong>Gender:</strong> {patient.gender || "N/A"}
                </p>

                {role === "admin" &&
                  patient.Appointments?.length > 0 &&
                  [
                    ...new Map(
                      patient.Appointments.map((appt) => [
                        appt.Doctor?.id,
                        appt.Doctor,
                      ])
                    ).values(),
                  ].map((doctor, idx) => (
                    <div key={idx}>
                      <p>
                        <strong>Doctor Name:</strong>{" "}
                        {doctor?.fullName || "N/A"}
                      </p>
                    </div>
                  ))}

                <div className="analytics">
                  <button onClick={() => setModalPatient(patient)}>
                    <IoMdAddCircleOutline className="icons" />
                    Add Analysis
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/analysis-see/${patient.id}`, {
                        state: { patient },
                      })
                    }
                  >
                    <BsDatabaseExclamation className="icons" />
                    See Analysis
                  </button>
                </div>
              </div>
            </div>
          ))

             )}
      </div>

      <AddAnalysisModal
        open={!!modalPatient}
        patientId={modalPatient?.id}
        onClose={() => setModalPatient(null)}
        onSaved={loadPatients}
      />
    </div>
  );
};

export default Patients;
