import doctorImg from "/icon1.png";
import appointmentImg from "/icon2.png";
import patientImg from "/icon3.png";
import { useEffect, useState } from "react";
import avatarImg from "/avatar.png"; // placeholder for all users
import { RxCrossCircled } from "react-icons/rx";
import toast from "react-hot-toast";
import { secureFetch } from "./api";
import Loading from "../components/Loading";

const Dashboard = ({ role, token }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
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
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        let url = "";
        if (role === "admin") {
          url = `${
            import.meta.env.VITE_BASE_URL
          }/api/appointment/admin/all/appointments`;
        } else if (role === "doctor") {
          url = `${
            import.meta.env.VITE_BASE_URL
          }/api/appointment/doctor/my/appointments`;
        } else {
          setLoading(false);
          return;
        }
        // console.log("API URL =>", url);

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log(data);
        if (res.ok) {
          setAppointments(data.data);
        } else {
          toast.error(data.error || "Failed to fetch appointments");
        }
      } catch {
        toast.success("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [role, token]);
  const handleCancel = async (appointmentId) => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/appointment/${appointmentId}/cancel`,
        {
          method: "PUT",
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Appointment cancelled");
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === appointmentId ? { ...a, status: "cancelled" } : a
          )
        );
      } else {
        toast.error(data.error || "Failed to cancel");
      }
    } catch {
      toast.error("Network error");
    }
  };
  const [patients, setPatients] = useState([]);

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

  return (
    <div className="dashboard">
      <div className="stats">
        <div className="statCard">
          <img src={appointmentImg} />
          <div className="text">
            <h3>{appointments.length}</h3>
            <p>Appointments</p>
          </div>
        </div>
        {role === "admin" && (
          <a href="/doctors" className="statCard">
            <img src={doctorImg} />
            <div className="text">
              <h3>{doctors.length}</h3>
              <p>Doctors</p>
            </div>
          </a>
        )}
        <a href="/patients" className="statCard">
          <img src={patientImg} />
          <div className="text">
            <h3>{patients.length}</h3>
            <p>Patients</p>
          </div>
        </a>
      </div>

      <div className="appointmentsCard">
        <h4>📋 Latest Appointment</h4>
        <ul>
          {appointments.length === 0 ? (
            <span className="error">No Latest Appointments available.</span>
          ) : (
            appointments.map((item, idx) => (
              <li className="appointmentItem" key={idx}>
                <div className="left">
                  <img src={item.Patient?.image || avatarImg} alt="Avatar" />
                  <div>
                    <p className="name">{item.Patient?.fullName}</p>
                    <p className="date">
                      {item.time} {item.date}
                    </p>
                  </div>
                  <div className="services">
                    <span>
                      <strong>service : </strong>
                      {item.Service?.name}
                    </span>
                    <span>
                      <strong>fee : </strong>
                      {item.Service?.fee}
                    </span>
                  </div>
                </div>
                <button
                  className="cancel"
                  onClick={() => handleCancel(item.id)}
                >
                  <RxCrossCircled />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
