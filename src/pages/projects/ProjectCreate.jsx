import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AxiosApi from "../../api/AxiosApi";

export default function ProjectCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    targetEndDate: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await AxiosApi.projectCreate({
        ...form,
        targetEndDate: form.targetEndDate || null,
      });

      alert("프로젝트가 등록되었습니다.");
      navigate("/projects");
    } catch (error) {
      console.error(error);
      alert("프로젝트 등록에 실패했습니다.");
    }
  };

  return (
    <main style={{ maxWidth: 700, margin: "40px auto" }}>
      <h1>프로젝트 생성</h1>

      <form onSubmit={handleSubmit}>
        <p>
          <input
            name="name"
            placeholder="프로젝트 이름"
            value={form.name}
            onChange={handleChange}
            required
          />
        </p>

        <p>
          <textarea
            name="description"
            placeholder="프로젝트 설명"
            value={form.description}
            onChange={handleChange}
          />
        </p>

        <p>
          <label>
            목표 종료일:{" "}
            <input
              type="date"
              name="targetEndDate"
              value={form.targetEndDate}
              onChange={handleChange}
            />
          </label>
        </p>

        <button type="submit">프로젝트 등록</button>
        <button type="button" onClick={() => navigate("/projects")}>
          취소
        </button>
      </form>
    </main>
  );
}
