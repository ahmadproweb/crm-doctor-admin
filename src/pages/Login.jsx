import { useState } from "react";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [inputValue, setInputValue] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("doctor");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = role === "admin" ? "admin/login" : "doctor/login";

    const payload = { email: inputValue, password };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();

      if (response.ok) {
        toast.success("Login successful");

        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        toast.error(data.message || "Login failed");
        // console.log(data);
      }
    } catch  {
      // console.error(error);
      toast.error("An error occurred during login.");
    }
  };

  return (
    <>
      <div className="auth-container">
        <form className="auth-box" onSubmit={handleSubmit}>
          <h2>Login</h2>
          <p>Please login to book appointment</p>

          <label htmlFor="email">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ?  <FaEye />: <FaEyeSlash /> }
            </span>
          </div>
          <div className="check-box">
            <p>Select Role:</p>
            <div className="checkbox">
              <input
                type="radio"
                value="admin"
                checked={role === "admin"}
                onChange={(e) => setRole(e.target.value)}
              />
              Admin
            </div>
            <div className="checkbox">
              <input
                type="radio"
                value="doctor"
                checked={role === "doctor"}
                onChange={(e) => setRole(e.target.value)}
              />
              doctor
            </div>
          </div>

          <button type="submit">Login</button>
        </form>
      </div>
    </>
  );
};

export default Login;
