export const selectUser = (state) => state.auth.user;
export const selectData = (state) => state.auth.data;
export const selectIsAuthed = (state) => !!state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectBootstrapped = (state) => state.auth.bootstrapped;
export const selectSelectedHotel = (state) => state.auth.selectedHotel;
export const selectSelectedHotelStatus = (state) =>
  state.auth.selectedHotelStatus;
export const selectSelectedHotelError = (state) =>
  state.auth.selectedHotelError;
