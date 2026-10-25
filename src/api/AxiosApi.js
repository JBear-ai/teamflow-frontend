import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080", withCredentials: true });
// Read a fresh masked token from the session before every mutation. This also
// handles login/logout rotation and multiple tabs without persistent token storage.
api.interceptors.request.use(async (config) => {
  if (!["get", "head", "options"].includes((config.method || "get").toLowerCase())) {
    const { data } = await api.get("/api/auth/csrf");
    config.headers[data.headerName] = data.token;
  }
  return config;
});
api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && error.config?.url?.startsWith("/api/projects")) {
    window.dispatchEvent(new Event("teamflow:unauthorized"));
  }
  return Promise.reject(error);
});
const AxiosApi = {
  projectCreate: data => api.post("/api/projects", data),
  projectList: () => api.get("/api/projects"),
  projectDetail: id => api.get(`/api/projects/${id}`),
  projectUpdate: (id, data) => api.put(`/api/projects/${id}`, data),
  projectDelete: id => api.delete(`/api/projects/${id}`),
  signup: data => api.post("/api/auth/signup", data),
  login: data => api.post("/api/auth/login", data),
  me: () => api.get("/api/auth/me"),
  logout: () => api.post("/api/auth/logout"),
};
export default AxiosApi;
