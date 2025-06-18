import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      // try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/doctor`);
      const data = await res.json();
      setDoctors(data.doctors);
      // } catch (err) {
      //   console.error("Failed to fetch doctors:", err);
      // }
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

  return (
    <div className="top_doctors">
      <h1>All Doctors</h1>
      <div className="boxes">
        {doctors.length === 0 ? (
          <span className="error">No doctors available.</span>
        ) : (
          doctors.map((doctor) => (
            <div className="box" key={doctor.id}>
              <div className="img">
                <img src={doctor.image || "/doctor-1.png"} alt={doctor.name} />
              </div>
              <div className="text">
                <h4>Dr. {doctor.fullName}</h4>
                <p>{doctor.speciality}</p>
                <p style={{ textTransform: 'lowercase' }}>{doctor.email}</p>
                <p>{doctor.experience}</p>
                {Array.isArray(doctor.services) && doctor.services.length > 0 && (
                  <div className="services">
                    {doctor.services.map((service, index) => (
                      <>
                        <p key={index}>{service.name}</p>
                        <p key={index}>{service.fee}</p>
                      </>
                    ))}
                  </div>
                )}
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
