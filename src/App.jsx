import { AuthProvider, ProtectedRoute } from "./auth/AuthContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProjectList from "./pages/projects/ProjectList";
import ProjectCreate from "./pages/projects/ProjectCreate";
import ProjectDetail from "./pages/projects/ProjectDetail";

import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider><Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/projects/create" element={<ProjectCreate />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        </Route>
      </Routes></AuthProvider>
    </BrowserRouter>
  );
}

export default App;

