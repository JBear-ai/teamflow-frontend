import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AxiosApi from "../../api/AxiosApi";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
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
      await AxiosApi.signup(form);

      alert("회원가입이 완료되었습니다.");
      navigate("/login");
    } catch (error) {
      console.error(error);

      if (error.response?.status === 409) {
        alert("이미 가입된 이메일입니다.");
      } else {
        alert("회원가입에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 400, margin: "60px auto" }}>
      <h1>TeamFlow 회원가입</h1>

      <form onSubmit={handleSubmit}>
        <p>
          <label htmlFor="name">이름</label>
          <br />
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </p>

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
          <label htmlFor="password">비밀번호 (8자 이상)</label>
          <br />
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />
        </p>

        <button type="submit" disabled={loading}>
          {loading ? "가입 중..." : "회원가입"}
        </button>
      </form>

      <p>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </main>
  );
}
