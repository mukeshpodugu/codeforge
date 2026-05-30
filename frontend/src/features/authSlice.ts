import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  fullName: string;
  avatar: string;
  bio: string;
  skills: string[];
  streak: number;
  lastActive: string;
  solvedStats: { easy: number; medium: number; hard: number };
  submissionsCount: number;
  acceptedCount: number;
  contestRating: number;
  submissionCalendar: Record<string, number>;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  profile: UserProfile;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    },
    authFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateProfileSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { authStart, authSuccess, authFailure, updateProfileSuccess, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
