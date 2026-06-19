import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMeAdmin } from "./Redux/auth/auth.thunk";
import { selectBootstrapped, selectUser } from "./Redux/auth/auth.selectors";
import AdminLoginPage from "./Pages/AdminLoginPage.jsx";
import AdminWelcomePage from "./Pages/AdminWelcomePage.jsx";

function ProtectedRoute({ children }) {
  const adminUser = useSelector(selectUser);

  if (!adminUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const dispatch = useDispatch();
  const bootstrapped = useSelector(selectBootstrapped);
  const adminUser = useSelector(selectUser);

  useEffect(() => {
    dispatch(fetchMeAdmin());
  }, [dispatch]);

  if (!bootstrapped) {
    return <div className="splash">Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={adminUser ? "/admin" : "/login"} replace />}
      />
      <Route path="/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminWelcomePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
