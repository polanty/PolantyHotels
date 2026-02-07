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

  +console.log(userData);

  // Optional: show splash while checking cookie session
  if (!bootstrapped) return null; // or your loading component

  //   return (
  //     <>
  //       {/* Header / Nav could go here */}
  //       <Outlet />
  //       {/* Footer could go here */}
  //     </>
  //   );
  // }
  return (
    <div>
      <nav style={{ display: "flex", gap: 12, padding: 16 }}>
        <Link to="/">Home</Link>

        {isAuthed ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <span>Hi, {userData?.first_name ?? "User"}</span>
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
