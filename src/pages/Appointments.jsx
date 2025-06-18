import React, { useEffect, useState } from "react";
import { RxCrossCircled } from "react-icons/rx";
import avatar from "/avatar.png";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Appointments = ({ role, token }) => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);

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
          setError("Unauthorized role");
          setLoading(false);
          return;
        }

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

  if (loading) return <div>Loading appointments...</div>;
  if (error) return <div className="error">{error}</div>;

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

  return (
    <div className="appointments">
      <h2 className="title">All Appointments</h2>
      <div className="table-container">
        <table className="appointment-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Patient</th>
              <th>Payment</th>
              <th>Date & Time</th>
              {role === "admin" && <th>Doctor</th>}
              <th>Fees</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((app, index) => {
              // Adjust data depending on response structure
              const patientName = app.User?.fullName || app.fullName || "N/A";
              const doctorName =
                role === "admin"
                  ? app.Doctor?.name || "N/A"
                  : `Dr. ${app.Doctor?.name || "You"}`;
              const doctorImage = app.Doctor?.image || "avatar.png";
              const DoctorFees = app.Doctor?.fees || "N/A";

              // Format date-time string nicely, if needed
              const dateTime = `${app.date} ${app.time}`;

              return (
                <tr key={app.id || index}>
                  <td>{index + 1}</td>
                  <td className="patient-info">
                    <img src={avatar} alt="avatar" />
                    <span>{patientName}</span>
                  </td>
                  <td>
                    <span className="payment-type">{app.payment}</span>
                  </td>
                  <td>{dateTime}</td>
                  {role === "admin" && (
                    <td className="doctor-info">
                      <img src={doctorImage} alt="avatar" />
                      <span>{doctorName}</span>
                    </td>
                  )}
                  <td>{DoctorFees} RON</td>
                  <td className={`status ${app.status || "unknown"}`}>
                    {app.status || "Unknown"}
                  </td>
                  <td>
                    <button
                      className="record-btn"
                      onClick={() =>
                        navigate(`/appointments/${app.id}/medical-record`, {
                          state: { medicalRecord: app.medicalRecord || null },
                        })
                      }
                    >
                      Medical record
                    </button>
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleCancel(app.id)}
                    >
                      <RxCrossCircled />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Appointments;
