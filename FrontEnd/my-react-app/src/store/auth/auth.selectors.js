export const selectUser = (state) => state.auth.user;
export const selectIsAuthed = (state) => !!state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectBootstrapped = (state) => state.auth.bootstrapped;
