import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authApi } from "../../api/auth.api";
import { selectUser } from "../../store/auth/auth.selectors";
import { setUser } from "../../store/auth/auth.slice";
import "./accountPages.css";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [email, setEmail] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    password: "",
    passwordConfirm: "",
  });
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setEmail(user?.email || "");
  }, [user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const showMessage = (nextStatus, nextMessage) => {
    setStatus(nextStatus);
    setMessage(nextMessage);
  };

  const updatePasswordField = (event) => {
    const { name, value } = event.target;
    setPasswordForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    showMessage("loading", "");

    try {
      const response = await authApi.updateEmail({ email });
      dispatch(setUser(response.data?.data?.user));
      showMessage("succeeded", "Email updated.");
    } catch (error) {
      showMessage("failed", error.message || "Unable to update email.");
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    showMessage("loading", "");

    try {
      await authApi.updatePassword(passwordForm);
      setPasswordForm({
        currentPassword: "",
        password: "",
        passwordConfirm: "",
      });
      showMessage("succeeded", "Password updated.");
    } catch (error) {
      showMessage("failed", error.message || "Unable to update password.");
    }
  };

  const handleDeleteAccount = async () => {
    const shouldDelete = window.confirm(
      "Delete your account? You will be signed out and your account will be made inactive.",
    );

    if (!shouldDelete) return;

    showMessage("loading", "");

    try {
      await authApi.deleteAccount();
      dispatch(setUser(null));
      navigate("/", { replace: true });
    } catch (error) {
      showMessage("failed", error.message || "Unable to delete account.");
    }
  };

  return (
    <section className="accountPage">
      <div className="accountHero">
        <h1>Settings</h1>
        <p>Manage account security and account status.</p>
      </div>

      {message && (
        <p className={`accountMessage ${status === "failed" ? "error" : "success"}`}>
          {message}
        </p>
      )}

      <form className="accountPanel" onSubmit={handleEmailSubmit}>
        <h2>Email</h2>
        <div className="accountForm">
          <label htmlFor="email">
            Email address
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
        </div>
        <div className="accountActions">
          <button className="btn btn--primary" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Saving..." : "Update email"}
          </button>
        </div>
      </form>

      <form className="accountPanel" onSubmit={handlePasswordSubmit}>
        <h2>Password</h2>
        <div className="accountForm">
          <label htmlFor="currentPassword">
            Current password
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={updatePasswordField}
              required
            />
          </label>
          <label htmlFor="password">
            New password
            <input
              id="password"
              name="password"
              type="password"
              minLength="8"
              value={passwordForm.password}
              onChange={updatePasswordField}
              required
            />
          </label>
          <label htmlFor="passwordConfirm">
            Confirm new password
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              minLength="8"
              value={passwordForm.passwordConfirm}
              onChange={updatePasswordField}
              required
            />
          </label>
        </div>
        <div className="accountActions">
          <button className="btn btn--primary" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Saving..." : "Update password"}
          </button>
        </div>
      </form>

      <div className="accountPanel dangerZone">
        <h2>Delete account</h2>
        <p>This makes your account inactive and signs you out.</p>
        <div className="accountActions">
          <button
            className="btn btn--primary"
            type="button"
            disabled={status === "loading"}
            onClick={handleDeleteAccount}
          >
            Delete account
          </button>
        </div>
      </div>
    </section>
  );
}
