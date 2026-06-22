import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PaginationControls from "../Components/PaginationControls.jsx";
import {
  fetchUserDetailsByAdminThunk,
  fetchUsersByAdminThunk,
} from "../Redux/auth/auth.thunk";
import {
  selectAdminUsers,
  selectAdminUsersError,
  selectAdminUsersPagination,
  selectAdminUsersStatus,
  selectSelectedAdminUser,
  selectSelectedAdminUserBookings,
  selectSelectedAdminUserError,
  selectSelectedAdminUserStatus,
} from "../Redux/auth/auth.selectors";
import { formatDate, formatMoney, getUserName } from "../utils/adminFormatters";

export default function AdminUsersPage() {
  const dispatch = useDispatch();
  const users = useSelector(selectAdminUsers);
  const usersStatus = useSelector(selectAdminUsersStatus);
  const usersError = useSelector(selectAdminUsersError);
  const usersPagination = useSelector(selectAdminUsersPagination);
  const selectedUser = useSelector(selectSelectedAdminUser);
  const selectedUserBookings = useSelector(selectSelectedAdminUserBookings);
  const selectedUserStatus = useSelector(selectSelectedAdminUserStatus);
  const selectedUserError = useSelector(selectSelectedAdminUserError);
  const [currentPage, setCurrentPage] = useState(1);
  const isLoadingUsers = usersStatus === "loading";
  const isLoadingSelectedUser = selectedUserStatus === "loading";

  useEffect(() => {
    dispatch(fetchUsersByAdminThunk({ page: currentPage, limit: 10 }));
  }, [currentPage, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchUsersByAdminThunk({ page: currentPage, limit: 10 }));
  };

  return (
    <main className="adminShell adminDashboard">
      <section className="managementGrid" aria-label="Registered users">
        <div className="usersPanel">
          <div className="panelHeader">
            <div>
              <p className="adminEyebrow">Registered users</p>
              <h1>Users</h1>
            </div>
            <button
              type="button"
              className="secondaryButton"
              onClick={handleRefresh}
              disabled={isLoadingUsers}
            >
              {isLoadingUsers ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {usersError && <p className="authMessage error">{usersError}</p>}

          <div className="tableWrap">
            <table className="usersTable">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Bookings</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <button
                        type="button"
                        className="tableLink"
                        onClick={() =>
                          dispatch(fetchUserDetailsByAdminThunk(user._id))
                        }
                      >
                        {getUserName(user) || "Unnamed user"}
                      </button>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.bookingCount || 0}</td>
                  </tr>
                ))}
                {!isLoadingUsers && users.length === 0 && (
                  <tr>
                    <td colSpan="4">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls
            isLoading={isLoadingUsers}
            onPageChange={setCurrentPage}
            pagination={usersPagination}
          />
        </div>

        <div className="detailsPanel">
          <div>
            <p className="adminEyebrow">User details</p>
            <h2>{selectedUser ? getUserName(selectedUser) : "Select a user"}</h2>
          </div>

          {isLoadingSelectedUser && <p>Loading user details...</p>}
          {selectedUserError && (
            <p className="authMessage error">{selectedUserError}</p>
          )}

          {selectedUser && !isLoadingSelectedUser && (
            <>
              <dl className="detailsList">
                <div>
                  <dt>Email</dt>
                  <dd>{selectedUser.email}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>{selectedUser.role}</dd>
                </div>
                <div>
                  <dt>Nationality</dt>
                  <dd>{selectedUser.nationality || "Not set"}</dd>
                </div>
                <div>
                  <dt>Date of birth</dt>
                  <dd>{formatDate(selectedUser.date_of_birth)}</dd>
                </div>
                <div>
                  <dt>Joined</dt>
                  <dd>{formatDate(selectedUser.created_at)}</dd>
                </div>
                <div>
                  <dt>Last login</dt>
                  <dd>{formatDate(selectedUser.last_login)}</dd>
                </div>
              </dl>

              <div>
                <h3>Bookings</h3>
                <div className="bookingList">
                  {selectedUserBookings.map((booking) => (
                    <article className="bookingItem" key={booking._id}>
                      <div>
                        <strong>
                          {booking.hotel?.name || "Hotel unavailable"}
                        </strong>
                        <span>
                          {formatDate(booking.checkInDate)} to{" "}
                          {formatDate(booking.checkOutDate)}
                        </span>
                      </div>
                      <dl>
                        <div>
                          <dt>Status</dt>
                          <dd>{booking.status}</dd>
                        </div>
                        <div>
                          <dt>Payment</dt>
                          <dd>{booking.paymentStatus}</dd>
                        </div>
                        <div>
                          <dt>Total</dt>
                          <dd>
                            {formatMoney(booking.totalPrice, booking.currency)}
                          </dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                  {selectedUserBookings.length === 0 && (
                    <p>This user has no bookings yet.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
