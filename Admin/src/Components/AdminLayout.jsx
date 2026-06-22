import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../Redux/auth/auth.selectors";

const navItems = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/create-user", label: "Create user" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/reviews", label: "Reviews" },
];

export default function AdminLayout() {
  const adminUser = useSelector(selectUser);
  const displayName = adminUser?.first_name || adminUser?.email || "Admin";

  return (
    <div className="adminLayout">
      <header className="adminTopNav">
        <div>
          <p className="adminEyebrow">Polanty Hotels</p>
          <strong>{displayName}</strong>
        </div>
        <nav aria-label="Admin navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "navLink active" : "navLink"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
