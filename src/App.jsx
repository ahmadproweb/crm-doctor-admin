import {
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import SideNavbar from "./layout/SideNavbar";
import TopNavbar from "./layout/TopNavbar";

import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import AddDoctor from "./pages/AddDoctor";
import Doctors from "./pages/Doctors.jsx";
import Patients from "./pages/Patients";
import Analysis from "./pages/Analysis.jsx";
import MedicalRecords from "./pages/MedicalRecords.jsx";
import Login from "./pages/Login.jsx";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!token) {
          setIsAuthenticated(false);
          setRole(null);
          localStorage.removeItem("doctor");
          localStorage.clear();
          navigate("/login");
          return;
        }

        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/check-session`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (res.ok && data.isAuthenticated) {
          setIsAuthenticated(true);
          setRole(data.role);
          // console.log(data.role);
        } else {
          setIsAuthenticated(false);
          setRole(null);
          localStorage.removeItem("doctor");
          localStorage.clear();
          navigate("/login");
        }
      } catch {
        setIsAuthenticated(false);
        setRole(null);
        localStorage.removeItem("doctor");
        localStorage.clear();
        navigate("/login");
      }
    };

    checkAuth();

    const interval = setInterval(checkAuth, 10000);

    return () => clearInterval(interval);
  }, [navigate]);

  const PrivateRoute = ({ children }) => {
    if (isAuthenticated === null) return null;
    if (!isAuthenticated) return <Navigate to="/login" />;
    return children;
  };

  return (
    <>
      <Toaster
        containerStyle={{
          zIndex: 99999,
        }}
      />

      <TopNavbar role={role} />
      <div className="main-layout">
        <SideNavbar role={role} />
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard role={role} token={token} />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard role={role} token={token} />
              </PrivateRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <PrivateRoute>
                <Appointments role={role} token={token} />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor-create"
            element={
              <PrivateRoute>
                <AddDoctor mode="create" role={role} />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor-edit/:id"
            element={
              <PrivateRoute>
                <AddDoctor mode="edit" role={role} />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctors"
            element={
              <PrivateRoute>
                <Doctors role={role} />
              </PrivateRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <PrivateRoute>
                <Patients role={role} />
              </PrivateRoute>
            }
          />
          <Route path="/analysis-see/:id" element={<Analysis role={role} />} />
          <Route
            path="/appointments/:appointmentId/medical-record"
            element={<MedicalRecords token={token} />}
          />
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
