import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AxiosApi from "../../api/AxiosApi";

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await AxiosApi.projectList();
        setProjects(response.data);
      } catch (error) {
        console.error(error);
        alert("프로젝트 목록 조회에 실패했습니다.");
      }
    };

    fetchProjects();
  }, []);

  return (
    <main style={{ maxWidth: 700, margin: "40px auto" }}>
      <h1>TeamFlow 프로젝트 목록</h1>

      <button onClick={() => navigate("/projects/create")}>새 프로젝트</button>

      {projects.length === 0 ? (
        <p>등록된 프로젝트가 없습니다.</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <h3
                onClick={() => navigate(`/projects/${project.id}`)}
                style={{ cursor: "pointer", textDecoration: "underline" }}
              >
                {project.name}
              </h3>
              <p>{project.description}</p>
              <p>상태: {project.status}</p>
              <p>목표 종료일: {project.targetEndDate || "미정"}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
