import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import type { User, AuthState, LoginData, RegisterData } from '../types';
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('worknest_token'),
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return { user: null, token: null, isAuthenticated: false, isLoading: false };
    case 'UPDATE_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : null };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('worknest_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/me')
        .then(res => {
          dispatch({ type: 'SET_USER', payload: { user: res.data.data, token } });
        })
        .catch(() => {
          localStorage.removeItem('worknest_token');
          dispatch({ type: 'SET_LOADING', payload: false });
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (data: LoginData) => {
    const res = await axios.post('/api/auth/login', data);
    const { user, token } = res.data.data;
    localStorage.setItem('worknest_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    dispatch({ type: 'SET_USER', payload: { user, token } });
  };

  const register = async (data: RegisterData) => {
    const res = await axios.post('/api/auth/register', data);
    const { user, token } = res.data.data;
    localStorage.setItem('worknest_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    dispatch({ type: 'SET_USER', payload: { user, token } });
  };

  const logout = () => {
    localStorage.removeItem('worknest_token');
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
