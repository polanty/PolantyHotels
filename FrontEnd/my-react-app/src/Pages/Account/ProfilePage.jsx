import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authApi } from "../../api/auth.api";
import { selectUser } from "../../store/auth/auth.selectors";
import { setUser } from "../../store/auth/auth.slice";
import "./accountPages.css";

function toDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    nationality: "",
  });
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      date_of_birth: toDateInput(user.date_of_birth),
      nationality: user.nationality || "",
    });
  }, [user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await authApi.updateProfile(form);
      dispatch(setUser(response.data?.data?.user));
      setStatus("succeeded");
      setMessage("Profile updated.");
    } catch (error) {
      setStatus("failed");
      setMessage(error.message || "Unable to update profile.");
    }
  };

  return (
    <section className="accountPage">
      <div className="accountHero">
        <h1>Profile</h1>
        <p>Update your basic account information.</p>
      </div>

      <form className="accountPanel" onSubmit={handleSubmit}>
        <h2>Personal information</h2>
        <div className="accountForm">
          <label htmlFor="first_name">
            First name
            <input
              id="first_name"
              name="first_name"
              value={form.first_name}
              onChange={updateField}
              required
            />
          </label>
          <label htmlFor="last_name">
            Last name
            <input
              id="last_name"
              name="last_name"
              value={form.last_name}
              onChange={updateField}
              required
            />
          </label>
          <label htmlFor="date_of_birth">
            Date of birth
            <input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={form.date_of_birth}
              onChange={updateField}
              required
            />
          </label>
          <label htmlFor="nationality">
            Nationality
            <input
              id="nationality"
              name="nationality"
              value={form.nationality}
              onChange={updateField}
            />
          </label>
        </div>
        <div className="accountActions">
          <button className="btn btn--primary" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Saving..." : "Save profile"}
          </button>
        </div>
        {message && (
          <p className={`accountMessage ${status === "failed" ? "error" : "success"}`}>
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
