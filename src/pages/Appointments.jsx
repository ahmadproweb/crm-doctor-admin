// Appointments.jsx
import React, { useEffect, useState } from "react";
import { RxCrossCircled } from "react-icons/rx";
import { SiTicktick } from "react-icons/si";
import avatar from "/avatar.png";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import Loading from "../components/Loading";

const Appointments = ({ role, token }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
        toast.error("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [role, token]);

  // Load draft medical record from location
  useEffect(() => {
    if (location.state?.recordDraft && location.state?.appointmentId) {
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === location.state.appointmentId
            ? { ...app, draftRecord: location.state.recordDraft }
            : app
        )
      );
    }
  }, [location.state]);

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
  const handleSubmitMedicalRecord = async (appointmentId, record) => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/appointment/${appointmentId}/medical-record`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...record, markComplete: true }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Medical record submitted!");

        // ✅ remove localStorage draft
        localStorage.removeItem(`draftRecord-${appointmentId}`);

        // ✅ update UI
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === appointmentId
              ? { ...a, status: "complete", draftRecord: undefined }
              : a
          )
        );
      } else {
        toast.error(data.error || "Submission failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
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
                <th>Service</th>
                <th>Fees</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <span className="error">No Appointments available.</span>
              ) : (
                appointments.map((app, index) => {
                  const patientName =
                    app.Patient?.fullName || app.fullName || "N/A";
                  const patientImage =
                    app.Patient?.image || app.image || avatar;
                  const doctorName =
                    role === "admin"
                      ? app.Doctor?.fullName || "N/A"
                      : `Dr. ${app.Doctor?.fullName || "You"}`;
                  const doctorImage = app.Doctor?.image || avatar;
                  const DoctorServices = app.Service?.name || "N/A";
                  const DoctorFees = app.Service?.fee || "N/A";
                  const dateTime = `${app.date} ${app.time}`;

                  return (
                    <tr key={app.id || index}>
                      <td>{index + 1}</td>
                      <td className="patient-info">
                        <img src={patientImage} alt="avatar" />
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
                      <td>{DoctorServices}</td>
                      <td>{DoctorFees} RON</td>
                      <td className={`status ${app.status || "unknown"}`}>
                        {app.status || "Unknown"}
                      </td>
                      <td>
                        <button
                          className="record-btn"
                          onClick={() =>
                            navigate(`/appointments/${app.id}/medical-record`, {
                              state: {
                                medicalRecord: app.medicalRecord || null,
                              },
                            })
                          }
                        >
                          Medical record
                        </button>
                      </td>
                      <td className="action-btn">
                        <button
                          className="tick"
                          onClick={() => {
                            const localDraft = localStorage.getItem(
                              `draftRecord-${app.id}`
                            );
                            const parsedDraft = localDraft
                              ? JSON.parse(localDraft)
                              : null;

                            if (parsedDraft) {
                              handleSubmitMedicalRecord(app.id, parsedDraft);
                            } else {
                              toast.error(
                                "Please click Medical Record button, fill all fields, then click tick"
                              );
                            }
                          }}
                        >
                          <SiTicktick />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleCancel(app.id)}
                        >
                          <RxCrossCircled />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Appointments;
