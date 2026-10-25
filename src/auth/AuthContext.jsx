import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import AxiosApi from "../api/AxiosApi";

import { AuthContext, useAuth } from "./useAuth";
export function AuthProvider({ children }) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    AxiosApi.me().then(({ data }) => { if (active) setMember(data); })
      .catch(e => { if (active && e.response?.status !== 401) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    const expired = () => setMember(null);
    window.addEventListener("teamflow:unauthorized", expired);
    return () => { active = false; window.removeEventListener("teamflow:unauthorized", expired); };
  }, []);
  const login = async form => {
    const { data } = await AxiosApi.login(form);
    setMember(data);
    setError(false);
    return data;
  };
  const logout = async () => {
    await AxiosApi.logout();
    setMember(null);
  };
  return <AuthContext.Provider value={{ member, loading, error, login, logout }}>{children}</AuthContext.Provider>;
}
export function ProtectedRoute() {
  const { member, loading, error, logout } = useAuth();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  if (loading) return <p>로그인 상태 확인 중...</p>;
  if (error) return <p>서버 연결에 실패했습니다. 서버 상태를 확인한 후 새로고침해 주세요.</p>;
  if (!member) return <Navigate to="/login" state={{ from: location }} replace />;
  const handleLogout = async () => {
    setBusy(true);
    try { await logout(); } catch { alert("로그아웃에 실패했습니다. 다시 시도해 주세요."); }
    finally { setBusy(false); }
  };
  return <><header><span>{member.name}님 </span><button disabled={busy} onClick={handleLogout}>로그아웃</button></header><Outlet /></>;
}

