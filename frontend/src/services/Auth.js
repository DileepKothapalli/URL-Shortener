// src/services/auth.js
import { api } from '../api';

/** @param {{ username:string, password:string }} body */
export const signup = async (body) => {
  const { data } = await api.post('/auth/signup', body); // returns {token, …}
  localStorage.setItem('token', data.token);
  return data;
};

/** @param {{ username:string, password:string }} body */
export const login = async (body) => {
  const { data } = await api.post('/auth/login', body);  // returns {token, …}
  localStorage.setItem('token', data.token);
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
  return api.post('/auth/logout'); // (optional endpoint)
};
