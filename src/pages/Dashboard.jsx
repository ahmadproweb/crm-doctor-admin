import doctorImg from "/icon1.png";
import appointmentImg from "/icon2.png";
import patientImg from "/icon3.png";
import { useEffect, useState } from "react";
import avatarImg from "/avatar.png"; // placeholder for all users
import { RxCrossCircled } from "react-icons/rx";
import toast from "react-hot-toast";

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
  if (loading) return <div>Loading appointments...</div>;

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
        <div className="statCard">
          <img src={doctorImg} />
          <div className="text">
            <h3>{doctors.length}</h3>
            <p>Doctors</p>
          </div>
        </div>
        <div className="statCard">
          <img src={patientImg} />
          <div className="text">
            <h3>0</h3>
            <p>Patients</p>
          </div>
        </div>
      </div>

      <div className="appointmentsCard">
        <h4>📋 Latest Appointment</h4>
        <ul>
          {appointments.map((item, idx) => (
            <li className="appointmentItem" key={idx}>
              <div className="left">
                <img src={avatarImg} alt="Avatar" />
                <div>
                  <p className="name">{item.User?.fullName}</p>
                  <p className="date">
                    {item.time} {item.date}
                  </p>
                </div>
              </div>
              <button className="cancel" onClick={() => handleCancel(item.id)}>
                <RxCrossCircled />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
