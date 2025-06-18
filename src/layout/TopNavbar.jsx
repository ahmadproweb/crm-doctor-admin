import { useNavigate } from "react-router-dom";

const TopNavbar = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  return (
    <>
      <div className="top_navbar">
        <div className="logo_title">
          <div className="img">
            <img src="/logo.png" alt="" />
          </div>
          <h1>CareConnect</h1>
          <span>{role}</span>
        </div>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <hr />
    </>
  );
};

export default TopNavbar;
