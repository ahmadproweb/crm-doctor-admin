import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import avatar from "/avatar.png";

const AddDoctor = ({ mode = "create", role }) => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "",
    speciality: "", experience: "", about: "",
    image: null, scheduleDate: "", scheduleTime: "",
  });
  const [previewImage, setPreview] = useState(null);
  const [services, setServices] = useState([{ name: "", fee: "" }]);

  // Preload form data when editing
  useEffect(() => {
    if (!isEdit) return;
    const d = state?.doctor;
    if (!d) {
      toast.error("No doctor data supplied");
      navigate("/doctors");
      return;
    }
    setFormData({
      fullName: d.fullName,
      email: d.email,
      password: "",
      speciality: d.speciality,
      experience: d.experience,
      about: d.about,
      image: null,
      scheduleDate: d.scheduleDate ?? "",
      scheduleTime: d.scheduleTime ?? "",
    });
    setPreview(d.image);
    setServices(
      Array.isArray(d.services) && d.services.length
        ? d.services.map((s) => ({ name: s.name, fee: s.fee }))
        : [{ name: "", fee: "" }]
    );
  }, [isEdit, state, navigate]);

  if (role !== "admin") return <Navigate to="/" />;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((p) => ({ ...p, [name]: files ? files[0] : value }));
    if (name === "image" && files?.[0]) setPreview(URL.createObjectURL(files[0]));
  };

  const handleServiceChange = (i, e) => {
    const arr = [...services];
    arr[i][e.target.name] = e.target.value;
    setServices(arr);
  };

  const addService = () => setServices([...services, { name: "", fee: "" }]);
  const removeService = (i) =>
    setServices((s) => s.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || (!isEdit && !formData.password)) {
      return toast.error("Name, email & password are required");
    }

    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (k === "password" && isEdit && !v) return;
      if (v) fd.append(k, v);
    });
    fd.append("services", JSON.stringify(services));

    const token = localStorage.getItem("token");
    const url = isEdit
      ? `${import.meta.env.VITE_BASE_URL}/api/admin/doctor-update/${id}`
      : `${import.meta.env.VITE_BASE_URL}/api/admin/doctor-create`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Error");

      toast.success(data.message || (isEdit ? "Doctor updated" : "Doctor added"));
      navigate("/doctors");
    } catch (err) {
      toast.error(err.message || "Network error");
    }
  };

  return (
    <div className="add-doctor">
      <h3>{isEdit ? "Edit Doctor" : "Add Doctor"}</h3>
      <div className="form-container">
        <div className="avatar-section">
          <img src={previewImage || avatar} alt="Preview" />
          <label htmlFor="doctor-image" className="upload-label">
            Upload doctor picture
          </label>
          <input
            type="file"
            id="doctor-image"
            name="image"
            accept="image/*"
            onChange={handleChange}
            hidden
          />
        </div>

        <form className="doctor-form" onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="form-row">
            <div className="form-field">
              <label>Doctor name</label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label>Speciality</label>
              <select
                name="speciality"
                value={formData.speciality}
                onChange={handleChange}
              >
                {["General physician", "Gynecologist", "Dermatologist", "Pediatricians", "Neurologist", "Gastroenterologist"].map(sp => (
                  <option key={sp} value={sp}>{sp}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                  autoComplete="off" 
  autoCapitalize="none"
              />
            </div>
            <div className="form-field">
              <label>Experience</label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
              >
                {["1 year", "5 years", "10+ years"].map(exp => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                  autoComplete="off" 
  autoCapitalize="none"
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="form-row">
            <div className="form-field">
              <label>Schedule Date</label>
              <input
                type="date"
                name="scheduleDate"
                value={formData.scheduleDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label>Schedule Time</label>
              <input
                type="time"
                name="scheduleTime"
                value={formData.scheduleTime}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Services Section */}
          <div className="form-row">
            {services.map((s, i) => (
              <div className="form-field" key={i}>
                <label>Service Name</label>
                <input
                  name="name"
                  value={s.name}
                  onChange={(e) => handleServiceChange(i, e)}
                />
                <label>Service Fee</label>
                <input
                  name="fee"
                  type="number"
                  value={s.fee}
                  onChange={(e) => handleServiceChange(i, e)}
                />
                <div className="service-actions">
                  {i === services.length - 1 && (
                    <button type="button" onClick={addService}>Add Service</button>
                  )}
                  {services.length > 1 && (
                    <button type="button" onClick={() => removeService(i)}>Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* About + Submit */}
          <div className="textarea-row">
            <label>About</label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="submit" autoComplete="off">
            {isEdit ? "Update Doctor" : "Add Doctor"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDoctor;
