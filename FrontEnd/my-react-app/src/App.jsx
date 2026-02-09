import "./App.css";

import { Outlet, Link } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe, logoutThunk } from "./store/auth/auth.thunks";
import {
  selectBootstrapped,
  selectIsAuthed,
  selectUser,
} from "./store/auth/auth.selectors";

function App() {
  const dispatch = useDispatch();
  const bootstrapped = useSelector(selectBootstrapped);
  const isAuthed = useSelector(selectIsAuthed);
  const userData = useSelector(selectUser);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  console.log(`Bootstrap Before: ${bootstrapped}`);

  // Optional: show splash while checking cookie session
  if (!bootstrapped) {
    return <div className="splash">Loading...</div>;
  }
  // or your loading component

  console.log(`Bootstrap After: ${bootstrapped}`);

  return (
    <div>
      <nav style={{ display: "flex", gap: 12, padding: 16 }}>
        <Link to="/">Home</Link>

        {isAuthed ? (
          <>
            {console.log(userData)}
            <Link to="/dashboard">Dashboard</Link>
            <span>
              {userData && <span>Hi, {userData.user.first_name}</span>}
            </span>
            <button type="button" onClick={() => dispatch(logoutThunk())}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/auth">Login</Link>
        )}
      </nav>

      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
