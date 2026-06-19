import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminLoginThunk, fetchMeAdmin } from "../Redux/auth/auth.thunk";
import {
  selectAuthError,
  selectAuthStatus,
  selectUser,
} from "../Redux/auth/auth.selectors";

export default function AdminLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const adminUser = useSelector(selectUser);
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const isSubmitting = authStatus === "loading";

  useEffect(() => {
    if (adminUser) {
      navigate("/admin", { replace: true });
    }
  }, [adminUser, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((currentCredentials) => ({
      ...currentCredentials,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await dispatch(adminLoginThunk(credentials)).unwrap();
      navigate("/admin", { replace: true });
    } catch {
      // Redux stores the message for display below the form.
    }
  };

  if (adminUser) {
    return <Navigate to="/admin" replace />;
  }

  console.log("This is the admin user:", adminUser);

  return (
    <main className="adminShell">
      <section className="adminHero">
        <p className="adminEyebrow">Polanty Hotels</p>
        <h1>Admin login</h1>
        <p>Sign in with an admin account to continue to the dashboard.</p>
      </section>

      <section className="loginPanel" aria-labelledby="admin-login-title">
        <div>
          <p className="adminEyebrow">Secure access</p>
          <h2 id="admin-login-title">Admin sign in</h2>
        </div>

        <form className="loginForm" onSubmit={handleSubmit}>
          <label htmlFor="email">
            Email
            <input
              id="email"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>

          <label htmlFor="password">
            Password
            <input
              id="password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {authError && <p className="authMessage error">{authError}</p>}
      </section>
    </main>
  );
}
