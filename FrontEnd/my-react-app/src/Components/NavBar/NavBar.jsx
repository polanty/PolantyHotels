import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectIsAuthed, selectUser } from "../../store/auth/auth.selectors";
import { logoutThunk } from "../../store/auth/auth.thunks";

export default function Navbar() {
  const dispatch = useDispatch();
  const isAuthed = useSelector(selectIsAuthed);
  const userData = useSelector(selectUser);

  return (
    <header className="topbar" role="banner">
      <nav className="container topbar__inner" aria-label="Top navigation">
        <div className="brand">
          <Link to="/" className="brand__link">
            <span
              className="material-symbols-outlined brand__icon"
              aria-hidden="true"
            >
              travel_explore
            </span>
            <h2 className="brand__name">Voyage</h2>
          </Link>
        </div>

        <div className="navlinks" aria-label="Primary links">
          <Link className="navlinks__link" to="/destinations">
            Destinations
          </Link>
          <Link className="navlinks__link" to="/deals">
            Deals
          </Link>
          <Link className="navlinks__link" to="/support">
            Support
          </Link>
        </div>

        {isAuthed ? (
          <div className="topbar__actions">
            <Link to="/dashboard">Dashboard</Link>

            {userData && (
              <span className="user-greeting">
                Hi, {userData.user.first_name}
              </span>
            )}

            <button
              className="btn btn--primary"
              type="button"
              onClick={() => dispatch(logoutThunk())}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="topbar__actions">
            <Link to="/auth" className="btn btn--muted" type="button">
              Sign In
            </Link>
            <button className="btn btn--primary" type="button">
              Sign Up
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
