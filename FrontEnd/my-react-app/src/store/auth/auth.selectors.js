export const selectUser = (state) => state.auth.user;
export const selectData = (state) => state.auth.hotels;
export const selectIsAuthed = (state) => !!state.auth.user;
export const selectAuthStatus = (state) => state.auth.authStatus;
export const selectAuthError = (state) => state.auth.authError;
export const selectBootstrapped = (state) => state.auth.bootstrapped;

//Single Hotel Selection
export const selectSelectedHotel = (state) => state.auth.selectedHotel;
export const selectSelectedHotelStatus = (state) =>
  state.auth.selectedHotelStatus;
export const selectSelectedHotelError = (state) =>
  state.auth.selectedHotelError;

// All Hotels Selection
export const paginatedHotelList = (state) => state.auth.hotels;
export const paginatedHotelsStatus = (state) => state.auth.hotelsStatus;
export const paginatedHotelsError = (state) => state.auth.hotelsError;
export const paginatedHotelsTotalPages = (state) => state.auth.totalPages;
export const paginatedHotelsCurrentPage = (state) => state.auth.currentPage;
export const paginatedHotelsResults = (state) => state.auth.results;
