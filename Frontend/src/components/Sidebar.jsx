import { NavLink } from "react-router-dom";
import { getSession } from "../utils/api";

function Sidebar() {
  const session = getSession();
  const customerLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/transactions", label: "Transactions" },
    { to: "/investments", label: "Investments" },
    { to: "/loan", label: "Loan Application" },
    { to: "/chat", label: "Support Chat" },
    { to: "/notifications", label: "Notifications" },
    { to: "/about", label: "About" },
  ];
  const adminLinks = [
    { to: "/admin-dashboard", label: "Admin Dashboard" },
    { to: "/loan-approval", label: "Loan Approval" },
    { to: "/customer-management", label: "Customer Management" },
    { to: "/admin-chat", label: "Admin Chat" },
    { to: "/about", label: "About" },
  ];

  const links = session?.role === "admin" ? adminLinks : customerLinks;

  return (
    <aside className="sidebar surface-card">
      <span className="eyebrow">Navigation</span>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
