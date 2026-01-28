import { useId, useState } from "react";
import "./Auth.page.css";

function AuthPage() {
  const emailId = useId();
  const passwordId = useId();

  const [mode, setMode] = useState("login"); // login | register
  const [showPassword, setShowPassword] = useState(false);

  const isLogin = mode === "login";

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: API call (login / register)
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left panel */}
        <div className="auth-hero">
          <div className="auth-hero-content">
            <div className="brand">
              <span className="icon">✈️</span>
              <span className="brand-name">Voyage</span>
            </div>

            <h1>Your next journey starts here.</h1>
            <p>
              Book your stay, your way. Discover hotels that are more than just
              a place to sleep.
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div className="auth-form-wrapper">
          <div className="auth-toggle">
            <button
              className={isLogin ? "active" : ""}
              onClick={() => setMode("login")}
              type="button"
            >
              Login
            </button>
            <button
              className={!isLogin ? "active" : ""}
              onClick={() => setMode("register")}
              type="button"
            >
              Register
            </button>
          </div>

          <div className="auth-header">
            <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
            <p>
              {isLogin
                ? "Login to continue your journey."
                : "Register to start your journey."}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor={emailId}>
              Email Address
              <input
                id={emailId}
                type="email"
                name="email"
                placeholder="Enter your email"
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
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {isLogin && (
              <a href="#" className="forgot-password">
                Forgot password?
              </a>
            )}

            <button type="submit" className="primary-btn">
              {isLogin ? "Login" : "Register"}
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
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
