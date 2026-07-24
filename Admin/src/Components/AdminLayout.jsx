import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../Redux/auth/auth.selectors";
import { logoutThunkAdmin } from "../Redux/auth/auth.thunk";

const navItems = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/create-user", label: "Create user" },
  { to: "/admin/hotels", label: "Hotels" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/reviews", label: "Reviews" },
];

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const adminUser = useSelector(selectUser);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const displayName = adminUser?.first_name || adminUser?.email || "Admin";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError("");

    try {
      await dispatch(logoutThunkAdmin()).unwrap();
      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(
        typeof error === "string" ? error : "Unable to log out. Please retry.",
      );
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="adminLayout">
      <header className="adminHeader">
        <div className="adminTopNav">
          <div>
            <p className="adminEyebrow">Polanty Hotels</p>
            <strong>{displayName}</strong>
          </div>
          <div className="adminHeaderActions">
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
            <button
              type="button"
              className="adminLogoutButton"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>
        </div>
        {logoutError && (
          <p className="adminLogoutError" role="alert">
            {logoutError}
          </p>
        )}
      </header>
      <Outlet />
    </div>
  );
}
