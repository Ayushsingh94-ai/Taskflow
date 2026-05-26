import axios from 'axios';

const API = axios.create({
  baseURL: 'https://taskflow-1-vcky.onrender.com/api'
});

// Automatically add token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);

// Tasks
export const getTasks = () => API.get('/tasks');
export const createTask = (data) => API.post('/tasks', data);
export const updateTaskStatus = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const getEmployees = () => API.get('/tasks/employees');

// Reports
export const submitReport = (data) => API.post('/reports', data);
export const getReports = () => API.get('/reports');
export const getReportsByTask = (taskId) => API.get(`/reports/task/${taskId}`);