import { useId, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginThunk, registerThunk } from "../../store/auth/auth.thunks";
import { clearAuthError } from "../../store/auth/auth.slice";
import {
  selectAuthError,
  selectAuthStatus,
} from "../../store/auth/auth.selectors";
import "./Auth.page.css";

function AuthPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);

  const emailId = useId();
  const passwordId = useId();
  const firstNameId = useId();
  const lastNameId = useId();
  const nationalityId = useId();
  const dateOfBirthId = useId();
  const profileImageId = useId();
  const passwordConfirmId = useId();

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const isLogin = mode === "login";
  const loading = status === "loading";

  useEffect(() => {
    if (!error) return undefined;

    const timer = setTimeout(() => {
      dispatch(clearAuthError());
    }, 4000);

    return () => clearTimeout(timer);
  }, [error, dispatch]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setSuccessMessage("");
    dispatch(clearAuthError());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    dispatch(clearAuthError());
    setSuccessMessage("");

    try {
      if (isLogin) {
        await dispatch(loginThunk({ email, password })).unwrap();
        setSuccessMessage("Login successful. Redirecting you now...");
      } else {
        await dispatch(registerThunk(formData)).unwrap();
        setSuccessMessage("Account created successfully. Redirecting you now...");
      }

      setTimeout(() => {
        navigate("/");
      }, 900);
    } catch {
      setSuccessMessage("");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-form-wrapper" aria-labelledby="auth-title">
        <div className="auth-brand">
          <span className="material-symbols-outlined" aria-hidden="true">
            travel_explore
          </span>
          <span>Voyage</span>
        </div>

        <div className="auth-toggle" aria-label="Authentication mode">
          <button
            className={isLogin ? "active" : ""}
            onClick={() => switchMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={!isLogin ? "active" : ""}
            onClick={() => switchMode("register")}
            type="button"
          >
            Register
          </button>
        </div>

        <div className="auth-header">
          <p className="auth-kicker">
            {isLogin ? "Secure access" : "Create your profile"}
          </p>
          <h1 id="auth-title">{isLogin ? "Welcome back" : "Create account"}</h1>
          <p>
            {isLogin
              ? "Sign in to manage bookings, favourites, and your upcoming stays."
              : "Join Voyage to save hotels, manage trips, and book faster."}
          </p>
        </div>

        {successMessage && (
          <div className="auth-alert auth-alert--success" role="status">
            <span className="material-symbols-outlined" aria-hidden="true">
              check_circle
            </span>
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="auth-alert auth-alert--error" role="alert">
            <span className="material-symbols-outlined" aria-hidden="true">
              error
            </span>
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="auth-name-grid">
              <label htmlFor={firstNameId}>
                First Name
                <input
                  id={firstNameId}
                  type="text"
                  name="first_name"
                  placeholder="First name"
                  autoComplete="given-name"
                  required
                />
              </label>

              <label htmlFor={lastNameId}>
                Last Name
                <input
                  id={lastNameId}
                  type="text"
                  name="last_name"
                  placeholder="Last name"
                  autoComplete="family-name"
                  required
                />
              </label>
            </div>
          )}

          {!isLogin && (
            <div className="auth-name-grid">
              <label htmlFor={dateOfBirthId}>
                Date of Birth
                <input
                  id={dateOfBirthId}
                  type="date"
                  name="date_of_birth"
                  autoComplete="bday"
                  required
                />
              </label>

              <label htmlFor={nationalityId}>
                Nationality
                <input
                  id={nationalityId}
                  type="text"
                  name="nationality"
                  placeholder="Nationality"
                  autoComplete="country-name"
                />
              </label>
            </div>
          )}

          <label htmlFor={emailId}>
            Email Address
            <input
              id={emailId}
              type="email"
              name="email"
              placeholder="name@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label htmlFor={passwordId}>
            Password
            <div className="password-field">
              <input
                id={passwordId}
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {!isLogin && (
            <label htmlFor={passwordConfirmId}>
              Confirm Password
              <input
                id={passwordConfirmId}
                type={showPassword ? "text" : "password"}
                name="passwordConfirm"
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
              />
            </label>
          )}

          {!isLogin && (
            <label htmlFor={profileImageId}>
              Profile Image
              <input
                id={profileImageId}
                className="auth-file-input"
                type="file"
                name="profile_image"
                accept="image/*"
              />
            </label>
          )}

          {isLogin && (
            <a href="#" className="forgot-password">
              Forgot password?
            </a>
          )}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading
              ? isLogin
                ? "Signing in..."
                : "Creating account..."
              : isLogin
                ? "Login"
                : "Register"}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button type="button" className="google-btn">
          Continue with Google
        </button>

        <p className="terms">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </section>
    </main>
  );
}

export default AuthPage;
