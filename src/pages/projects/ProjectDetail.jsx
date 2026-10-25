import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AxiosApi from "../../api/AxiosApi";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    targetEndDate: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await AxiosApi.projectDetail(id);
        const project = response.data;

        setForm({
          name: project.name,
          description: project.description || "",
          targetEndDate: project.targetEndDate || "",
        });
      } catch (error) {
        console.error(error);
        alert("프로젝트 조회에 실패했습니다.");
        navigate("/projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await AxiosApi.projectUpdate(id, {
        ...form,
        targetEndDate: form.targetEndDate || null,
      });

      alert("프로젝트가 수정되었습니다.");
      setEditing(false);
    } catch (error) {
      console.error(error);
      alert("프로젝트 수정에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 이 프로젝트를 삭제하시겠습니까?")) {
      return;
    }

    try {
      await AxiosApi.projectDelete(id);
      alert("프로젝트가 삭제되었습니다.");
      navigate("/projects");
    } catch (error) {
      console.error(error);
      alert("프로젝트 삭제에 실패했습니다.");
    }
  };

  if (loading) return <p>불러오는 중...</p>;

  return (
    <main style={{ maxWidth: 700, margin: "40px auto" }}>
      <h1>프로젝트 상세</h1>

      <form onSubmit={(e) => e.preventDefault()}>
        <p>
          <label>프로젝트 이름</label>
          <br />
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            disabled={!editing}
            required
          />
        </p>

        <p>
          <label>프로젝트 설명</label>
          <br />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            disabled={!editing}
          />
        </p>

        <p>
          <label>목표 종료일</label>
          <br />
          <input
            type="date"
            name="targetEndDate"
            value={form.targetEndDate}
            onChange={handleChange}
            disabled={!editing}
          />
        </p>

        {editing ? (
          <button type="button" onClick={handleUpdate}>
            저장
          </button>
        ) : (
          <button type="button" onClick={() => setEditing(true)}>
            수정
          </button>
        )}

        <button type="button" onClick={handleDelete}>
          삭제
        </button>

        <button type="button" onClick={() => navigate("/projects")}>
          목록으로
        </button>
      </form>
    </main>
  );
}
