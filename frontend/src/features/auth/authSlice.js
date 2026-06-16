import { createSlice } from '@reduxjs/toolkit';

// Load persisted auth state from localStorage
const loadAuthState = () => {
  try {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth);
      return {
        user: parsed.user || null,
        token: parsed.token || null,
        isAuthenticated: !!(parsed.user && parsed.token),
      };
    }
  } catch (e) {
    // Ignore parse errors
  }
  return { user: null, token: null, isAuthenticated: false };
};

const initialState = loadAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      // Persist to localStorage
      localStorage.setItem('auth', JSON.stringify({ user: action.payload.user, token: action.payload.token }));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
