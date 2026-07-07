import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMeAdmin } from "./Redux/auth/auth.thunk";
import { selectBootstrapped, selectUser } from "./Redux/auth/auth.selectors";
import AdminLayout from "./Components/AdminLayout.jsx";
import AdminBookingsPage from "./Pages/AdminBookingsPage.jsx";
import AdminCreateUserPage from "./Pages/AdminCreateUserPage.jsx";
import AdminHotelEditPage from "./Pages/AdminHotelEditPage.jsx";
import AdminHotelsPage from "./Pages/AdminHotelsPage.jsx";
import AdminLoginPage from "./Pages/AdminLoginPage.jsx";
import AdminReviewsPage from "./Pages/AdminReviewsPage.jsx";
import AdminUsersPage from "./Pages/AdminUsersPage.jsx";
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
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminWelcomePage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="create-user" element={<AdminCreateUserPage />} />
        <Route path="hotels" element={<AdminHotelsPage />} />
        <Route path="hotels/:hotelId" element={<AdminHotelEditPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
