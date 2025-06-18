import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { CiSearch } from "react-icons/ci";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
    setLoading(true);
    const fetchDoctors = async () => {
      try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/doctor`);
      const data = await res.json();
      setDoctors(data.doctors);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      }finally {
      setLoading(false);
    }
    };

    fetchDoctors();
  }, []);
  const navigate = useNavigate();
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this doctor?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/admin/doctor-delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Error deleting doctor");

      toast.success(data.message || "Doctor deleted");
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      toast.error(err.message || "Network error");
    }
  };
  if (loading) return <Loading/>;
 const filteredPatients = doctors.filter((p) =>
    `${p.fullName} ${p.speciality} ${p.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="top_doctors">
      <h1>All Doctors</h1>
      <div className="search">
              <input
                type="search"
                placeholder="Enter Name | Speciality | Email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <CiSearch className="search-icon" />
            </div>
      <div className="boxes">
        {filteredPatients.length === 0 ? (
          <span className="error">No doctors available.</span>
        ) : (
          filteredPatients.map((doctor) => (
            <div className="box" key={doctor.id}>
              <div className="img">
                <img src={doctor.image || "/doctor-1.png"} alt={doctor.name} />
              </div>
              <div className="text">
                <h4>Name : Dr. {doctor.fullName}</h4>
                <p>Speciality : {doctor.speciality}</p>
                <p style={{ textTransform: 'lowercase' }}>Email : {doctor.email}</p>
                <p>Experience : {doctor.experience}</p>
                <div className="actions">
                  <button
                    onClick={() =>
                      navigate(`/doctor-edit/${doctor.id}`, { state: { doctor } })
                    }
                  >
                    Edit
                  </button><button onClick={() => handleDelete(doctor.id)}>Delete</button>


                </div>


              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Doctors;
