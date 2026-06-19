export const selectUser = (state) => state.authAdmin.user;
export const selectIsAuthed = (state) => !!state.authAdmin.user;
export const selectAuthStatus = (state) => state.authAdmin.authStatus;
export const selectAuthError = (state) => state.authAdmin.authError;
export const selectBootstrapped = (state) => state.authAdmin.bootstrapped;
