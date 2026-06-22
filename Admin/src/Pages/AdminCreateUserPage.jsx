import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createUserByAdminThunk } from "../Redux/auth/auth.thunk";
import {
  selectCreateUserError,
  selectCreateUserStatus,
  selectCreatedUser,
} from "../Redux/auth/auth.selectors";
import { clearCreateUserResult } from "../Redux/auth/auth.slice";
import { getUserName } from "../utils/adminFormatters";

const initialUserForm = {
  first_name: "",
  last_name: "",
  email: "",
  nationality: "",
  date_of_birth: "",
  password: "",
  passwordConfirm: "",
};

export default function AdminCreateUserPage() {
  const dispatch = useDispatch();
  const createdUser = useSelector(selectCreatedUser);
  const createUserStatus = useSelector(selectCreateUserStatus);
  const createUserError = useSelector(selectCreateUserError);
  const [newUser, setNewUser] = useState(initialUserForm);
  const isCreatingUser = createUserStatus === "loading";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewUser((currentUser) => ({
      ...currentUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await dispatch(createUserByAdminThunk(newUser)).unwrap();
      setNewUser(initialUserForm);
    } catch {
      // Redux stores the message for display below the form.
    }
  };

  return (
    <main className="adminShell adminDashboard">
      <section className="loginPanel" aria-labelledby="create-user-title">
        <div>
          <p className="adminEyebrow">User management</p>
          <h1 id="create-user-title">Create user account</h1>
          <p>
            This creates a regular user account and keeps your admin session
            active.
          </p>
        </div>

        <form className="loginForm twoColumnForm" onSubmit={handleSubmit}>
          <label htmlFor="first_name">
            First name
            <input
              id="first_name"
              name="first_name"
              type="text"
              value={newUser.first_name}
              onChange={handleChange}
              autoComplete="given-name"
              required
            />
          </label>

          <label htmlFor="last_name">
            Last name
            <input
              id="last_name"
              name="last_name"
              type="text"
              value={newUser.last_name}
              onChange={handleChange}
              autoComplete="family-name"
              required
            />
          </label>

          <label htmlFor="email">
            Email
            <input
              id="email"
              name="email"
              type="email"
              value={newUser.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>

          <label htmlFor="nationality">
            Nationality
            <input
              id="nationality"
              name="nationality"
              type="text"
              value={newUser.nationality}
              onChange={handleChange}
              autoComplete="country-name"
            />
          </label>

          <label htmlFor="date_of_birth">
            Date of birth
            <input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={newUser.date_of_birth}
              onChange={handleChange}
              required
            />
          </label>

          <label htmlFor="password">
            Password
            <input
              id="password"
              name="password"
              type="password"
              value={newUser.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </label>

          <label htmlFor="passwordConfirm">
            Confirm password
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              value={newUser.passwordConfirm}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </label>

          <div className="formActions">
            <button type="submit" disabled={isCreatingUser}>
              {isCreatingUser ? "Creating..." : "Create user"}
            </button>
            {(createdUser || createUserError) && (
              <button
                type="button"
                className="secondaryButton"
                onClick={() => dispatch(clearCreateUserResult())}
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {createUserError && (
          <p className="authMessage error">{createUserError}</p>
        )}
        {createdUser && (
          <p className="authMessage success">
            Created user {getUserName(createdUser) || createdUser.email}
          </p>
        )}
      </section>
    </main>
  );
}
