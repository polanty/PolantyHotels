import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { authApi } from "../../api/auth.api";
import { selectUser } from "../../store/auth/auth.selectors";
import "./accountPages.css";

function formatDate(value) {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatMoney(value, currency) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency || "GBP",
  }).format(Number(value || 0));
}

export default function BookingsPage() {
  const user = useSelector(selectUser);
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    async function loadBookings() {
      setStatus("loading");
      setMessage("");

      try {
        const response = await authApi.getSuccessfulBookings();
        setBookings(response.data?.data?.bookings || []);
        setStatus("succeeded");
      } catch (error) {
        setStatus("failed");
        setMessage(error.message || "Unable to load bookings.");
      }
    }

    loadBookings();
  }, [user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <section className="accountPage">
      <div className="accountHero">
        <h1>Bookings</h1>
        <p>View your successful bookings.</p>
      </div>

      <div className="accountPanel">
        {status === "loading" && <p>Loading bookings...</p>}
        {message && <p className="accountMessage error">{message}</p>}

        {status !== "loading" && bookings.length === 0 && (
          <p>You do not have any successful bookings yet.</p>
        )}

        <div className="accountList">
          {bookings.map((booking) => (
            <article className="accountCard" key={booking._id}>
              <h3>
                {booking.hotel?.name ||
                  booking.room?.location_id?.name ||
                  "Hotel unavailable"}
              </h3>
              <p className="accountMeta">
                {formatDate(booking.checkInDate)} to {formatDate(booking.checkOutDate)}
              </p>
              <p>
                {booking.nights} night{booking.nights === 1 ? "" : "s"} ·{" "}
                {booking.numberOfRooms} room
                {booking.numberOfRooms === 1 ? "" : "s"}
              </p>
              <p>{formatMoney(booking.totalPrice, booking.currency)}</p>
              <p>Status: {booking.status}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
