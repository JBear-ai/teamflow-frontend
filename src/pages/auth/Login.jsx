import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      await login(form);
      const from = location.state?.from;
      navigate(from ? from.pathname + from.search + from.hash : "/projects", { replace: true });
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        alert("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        alert("로그인 요청에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 400, margin: "60px auto" }}>
      <h1>TeamFlow 로그인</h1>

      <form onSubmit={handleSubmit}>
        <p>
          <label htmlFor="email">이메일</label>
          <br />
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </p>

        <p>
          <label htmlFor="password">비밀번호</label>
          <br />
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </p>

        <button type="submit" disabled={loading}>
          {loading ? "확인 중..." : "로그인"}
        </button>
      </form>

      <p>
        계정이 없으신가요? <Link to="/signup">회원가입</Link>
      </p>
    </main>
  );
}


