export const selectUser = (state) => state.authAdmin.user;

// Authentication selectors
export const selectIsAuthed = (state) => !!state.authAdmin.user;
export const selectAuthStatus = (state) => state.authAdmin.authStatus;
export const selectAuthError = (state) => state.authAdmin.authError;

export const selectBootstrapped = (state) => state.authAdmin.bootstrapped;

//User creation selectors
export const selectCreatedUser = (state) => state.authAdmin.createdUser;
export const selectCreateUserStatus = (state) =>
  state.authAdmin.createUserStatus;
export const selectCreateUserError = (state) => state.authAdmin.createUserError;

// Admin user management selectors
export const selectAdminUsers = (state) => state.authAdmin.users;
export const selectAdminUsersStatus = (state) => state.authAdmin.usersStatus;
export const selectAdminUsersError = (state) => state.authAdmin.usersError;
export const selectAdminUsersPagination = (state) =>
  state.authAdmin.usersPagination;
export const selectSelectedAdminUser = (state) =>
  state.authAdmin.selectedUser;
export const selectSelectedAdminUserBookings = (state) =>
  state.authAdmin.selectedUserBookings;
export const selectSelectedAdminUserStatus = (state) =>
  state.authAdmin.selectedUserStatus;
export const selectSelectedAdminUserError = (state) =>
  state.authAdmin.selectedUserError;

// Admin booking selectors
export const selectAdminBookings = (state) => state.authAdmin.bookings;
export const selectAdminBookingsStatus = (state) =>
  state.authAdmin.bookingsStatus;
export const selectAdminBookingsError = (state) =>
  state.authAdmin.bookingsError;
export const selectAdminBookingsPagination = (state) =>
  state.authAdmin.bookingsPagination;

// Admin review selectors
export const selectAdminReviews = (state) => state.authAdmin.reviews;
export const selectAdminReviewsStatus = (state) =>
  state.authAdmin.reviewsStatus;
export const selectAdminReviewsError = (state) => state.authAdmin.reviewsError;
export const selectAdminReviewsPagination = (state) =>
  state.authAdmin.reviewsPagination;
