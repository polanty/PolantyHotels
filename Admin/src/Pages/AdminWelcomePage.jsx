import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBookingsByAdminThunk,
  fetchReviewsByAdminThunk,
  fetchUsersByAdminThunk,
} from "../Redux/auth/auth.thunk";
import {
  selectAdminBookings,
  selectAdminReviews,
  selectAdminUsers,
  selectUser,
} from "../Redux/auth/auth.selectors";

export default function AdminWelcomePage() {
  const dispatch = useDispatch();
  const adminUser = useSelector(selectUser);
  const users = useSelector(selectAdminUsers);
  const bookings = useSelector(selectAdminBookings);
  const reviews = useSelector(selectAdminReviews);
  const displayName = adminUser?.first_name || adminUser?.email || "Admin";

  useEffect(() => {
    dispatch(fetchUsersByAdminThunk());
    dispatch(fetchBookingsByAdminThunk());
    dispatch(fetchReviewsByAdminThunk());
  }, [dispatch]);

  return (
    <main className="adminShell adminDashboard">
      <section className="adminHero">
        <p className="adminEyebrow">Dashboard</p>
        <h1>Welcome, {displayName}</h1>
        <p>
          Use the navigation above to manage customer accounts, inspect
          bookings, and review guest feedback.
        </p>
      </section>

      <section className="statsGrid" aria-label="Admin summary">
        <article>
          <span>{users.length}</span>
          <strong>Users</strong>
        </article>
        <article>
          <span>{bookings.length}</span>
          <strong>Bookings</strong>
        </article>
        <article>
          <span>{reviews.length}</span>
          <strong>Reviews</strong>
        </article>
      </section>
    </main>
  );
}
