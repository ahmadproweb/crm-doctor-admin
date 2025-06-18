import {
  FaClipboardList,
  FaCalendarAlt,
  FaUserPlus,
  FaUserMd,
  FaUsers,
} from "react-icons/fa";
import { useLocation, Link } from "react-router-dom";

const SideNavbar = ({ role }) => {
  const location = useLocation();
  console.log(role);
  let links = [
    { label: "Dashboard", path: "/dashboard", icon: <FaClipboardList /> },
    { label: "Appointments", path: "/appointments", icon: <FaCalendarAlt /> },
    { label: "Patients", path: "/patients", icon: <FaUsers /> },
  ];

  if (role === "admin") {
    links = [
      ...links,
      { label: "Add Doctor", path: "/doctor-create", icon: <FaUserPlus /> },
      { label: "Doctors", path: "/doctors", icon: <FaUserMd /> },
    ];
  }

  return (
    <aside className="sidebar">
      <nav className="nav">
        <ul>
          {links.map((link) => (
            <li
              key={link.path}
              className={`navItem ${
                location.pathname === link.path ? "active" : ""
              }`}
            >
              <Link to={link.path} className="link">
                {link.icon}
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default SideNavbar;
