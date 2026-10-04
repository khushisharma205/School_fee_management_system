import axios from 'axios';

const api = axios.create({
<<<<<<< HEAD
  baseURL: 'https://school-fee-management-system-vm7k.onrender.com/api'
=======
  baseURL: 'http://localhost:5000/api'
>>>>>>> 79b0e6167da87b10227d6d7350fcbabbcf36eb25
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
