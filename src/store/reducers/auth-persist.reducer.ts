import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthPersistState {
  isLoggedIn: boolean;
  isOnboarding: boolean;
  isGuest: boolean;
  token: string | null;
  locale: string;
  role: string | null; 
}

const initialState: AuthPersistState = {
  isLoggedIn: false,
  isOnboarding: true,
  isGuest: false,
  token: null,
  locale: 'en',
  role: null,
};

const authPersistSlice = createSlice({
  name: 'authPersist',
  initialState,
  reducers: {
    setIsLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
    },
    setIsOnboarding: (state, action: PayloadAction<boolean>) => {
      state.isOnboarding = action.payload;
    },
    setIsGuest: (state, action: PayloadAction<boolean>) => {
      state.isGuest = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setLogout: (state) => {
      state.isLoggedIn = false;
      state.isGuest = false;
      state.token = null;
     state.role = null;
    },
    clearAuth: (state) => {
      state.isLoggedIn = false;
      state.token = null;
       state.role = null;
    },
    setLocale: (state, action: PayloadAction<string>) => {
      state.locale = action.payload;
      // i18n.locale = action.payload;
    }
   
  }
});




export const selectIsLoggedIn = (state: { authPersist: AuthPersistState }) => state.authPersist.isLoggedIn;
export const selectOnboarding = (state: { authPersist: AuthPersistState }) => state.authPersist.isOnboarding;
export const selectIsGuest = (state: { authPersist: AuthPersistState }) => state.authPersist.isGuest;
export const selectToken = (state: { authPersist: AuthPersistState }) => state.authPersist.token;
export const selectLocale = (state: { authPersist: AuthPersistState }) => state.authPersist.locale;

export const {
  setIsLoggedIn,
  setIsOnboarding,
  setIsGuest,
  setToken,
  setLogout,
  clearAuth,
  setLocale
} = authPersistSlice.actions;


export default authPersistSlice.reducer;