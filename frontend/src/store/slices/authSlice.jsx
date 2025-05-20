import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  user: {
    userId: null,
    email: null,
    role: null,
    branch: null
  },
  isAuthenticated: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.token = action.payload.token;
      state.user = {
        userId: action.payload.userId,
        email: action.payload.email,
        role: action.payload.role,
        branch: action.payload.branch
      };
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = null;
      state.user = { userId: null, email: null, role: null, branch: null };
      state.isAuthenticated = false;
    }
  }
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
