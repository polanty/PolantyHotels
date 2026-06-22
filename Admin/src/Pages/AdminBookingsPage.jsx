import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PaginationControls from "../Components/PaginationControls.jsx";
import { fetchBookingsByAdminThunk } from "../Redux/auth/auth.thunk";
import {
  selectAdminBookings,
  selectAdminBookingsError,
  selectAdminBookingsPagination,
  selectAdminBookingsStatus,
} from "../Redux/auth/auth.selectors";
import { formatDate, formatMoney, getUserName } from "../utils/adminFormatters";

export default function AdminBookingsPage() {
  const dispatch = useDispatch();
  const bookings = useSelector(selectAdminBookings);
  const bookingsStatus = useSelector(selectAdminBookingsStatus);
  const bookingsError = useSelector(selectAdminBookingsError);
  const bookingsPagination = useSelector(selectAdminBookingsPagination);
  const [currentPage, setCurrentPage] = useState(1);
  const isLoading = bookingsStatus === "loading";

  useEffect(() => {
    dispatch(fetchBookingsByAdminThunk({ page: currentPage, limit: 10 }));
  }, [currentPage, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchBookingsByAdminThunk({ page: currentPage, limit: 10 }));
  };

  return (
    <main className="adminShell adminDashboard">
      <section className="usersPanel fullPanel">
        <div className="panelHeader">
          <div>
            <p className="adminEyebrow">Booking management</p>
            <h1>All bookings</h1>
          </div>
          <button
            type="button"
            className="secondaryButton"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {bookingsError && <p className="authMessage error">{bookingsError}</p>}

        <div className="tableWrap">
          <table className="usersTable">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Hotel</th>
                <th>Stay</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{getUserName(booking.userRef) || booking.userRef?.email}</td>
                  <td>{booking.hotel?.name || "Hotel unavailable"}</td>
                  <td>
                    {formatDate(booking.checkInDate)} to{" "}
                    {formatDate(booking.checkOutDate)}
                  </td>
                  <td>{booking.status}</td>
                  <td>{booking.paymentStatus}</td>
                  <td>{formatMoney(booking.totalPrice, booking.currency)}</td>
                </tr>
              ))}
              {!isLoading && bookings.length === 0 && (
                <tr>
                  <td colSpan="6">No bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <PaginationControls
          isLoading={isLoading}
          onPageChange={setCurrentPage}
          pagination={bookingsPagination}
        />
      </section>
    </main>
  );
}
