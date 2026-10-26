import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AxiosApi from "../../api/AxiosApi";
import { useAuth } from "../../auth/useAuth";

const roleNames = { LEAD: "리더", CO_MANAGER: "공동 관리자", MEMBER: "팀원" };
function failure(error) {
  const status = error.response?.status;
  if (status === 409) return "이미 참여 중인 회원이거나 마지막 리더를 변경할 수 없습니다.";
  if (status === 403) return "권한이 변경되었거나 요청이 거부되었습니다. 현재 권한을 확인해 주세요.";
  if (status === 404) return "프로젝트, 팀원 또는 가입된 회원을 찾을 수 없습니다.";
  if (status === 400) return "이메일과 역할을 확인해 주세요.";
  return "요청에 실패했습니다. 연결 상태를 확인하고 다시 시도해 주세요.";
}
export default function ProjectDetail() {
  const { id } = useParams();
  return <ProjectDetailContent key={id} id={id} />;
}
function ProjectDetailContent({ id }) {
  const navigate = useNavigate();
  const { member } = useAuth();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", targetEndDate: "" });
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.all([AxiosApi.projectDetail(id), AxiosApi.projectMembers(id)])
      .then(([detail, team]) => {
        if (!active) return;
        setProject(detail.data);
        setMembers(team.data);
        setForm({ name: detail.data.name, description: detail.data.description || "", targetEndDate: detail.data.targetEndDate || "" });
        setEditing(false);
      }).catch(e => {
        if (!active) return;
        setProject(null);
        setError(failure(e));
      }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, revision]);
  const reload = () => { setLoading(true); setRevision(r => r + 1); };
  const lead = project?.myRole === "LEAD";
  const manage = lead || project?.myRole === "CO_MANAGER";
  const leadCount = members.filter(m => m.role === "LEAD").length;
  const mutate = async (action, after) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try { await action(); after?.(); }
    catch (e) { setError(failure(e)); }
    finally { setBusy(false); reload(); }
  };
  const update = e => {
    e.preventDefault();
    mutate(() => AxiosApi.projectUpdate(id, { ...form, targetEndDate: form.targetEndDate || null }));
  };
  if (loading) return <p role="status">불러오는 중...</p>;
  return <main style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}>
    <h1>프로젝트 상세</h1>
    {error && <p role="alert">{error}</p>}
    {!project ? <button onClick={reload}>다시 불러오기</button> : <>
      <p>내 역할: {roleNames[project.myRole]}</p>
      <form onSubmit={update}>
        <p><label>프로젝트 이름<br /><input name="name" value={form.name} required maxLength={100} disabled={!editing || busy} onChange={e => setForm({ ...form, name: e.target.value })} /></label></p>
        <p><label>프로젝트 설명<br /><textarea value={form.description} maxLength={2000} disabled={!editing || busy} onChange={e => setForm({ ...form, description: e.target.value })} /></label></p>
        <p><label>목표 종료일<br /><input type="date" value={form.targetEndDate} disabled={!editing || busy} onChange={e => setForm({ ...form, targetEndDate: e.target.value })} /></label></p>
        {manage && (editing ? <><button disabled={busy} type="submit">저장</button><button type="button" disabled={busy} onClick={reload}>취소</button></> : <button type="button" onClick={() => setEditing(true)}>수정</button>)}
        {lead && <button type="button" disabled={busy} onClick={() => {
          if (window.confirm("정말 이 프로젝트를 삭제하시겠습니까?")) mutate(() => AxiosApi.projectDelete(id), () => navigate("/projects"));
        }}>프로젝트 삭제</button>}
      </form>
      <section aria-labelledby="team-title">
        <h2 id="team-title">프로젝트 팀원</h2>
        <p>리더는 역할을 변경할 수 있습니다. 공동 관리자는 일반 팀원을 추가·제거할 수 있습니다. 마지막 리더는 유지해야 합니다.</p>
        {manage && <form onSubmit={e => { e.preventDefault(); mutate(() => AxiosApi.memberAdd(id, email.trim()), () => setEmail("")); }}>
          <label>가입된 회원 이메일 <input type="email" required maxLength={100} value={email} disabled={busy} onChange={e => setEmail(e.target.value)} /></label>
          <button disabled={busy} type="submit">팀원 추가</button>
        </form>}
        <ul>{members.map(m => {
          const lastLead = m.role === "LEAD" && leadCount === 1;
          const canRemove = manage && m.memberId !== member?.id && !lastLead && (lead || m.role === "MEMBER");
          return <li key={m.memberId} style={{ margin: "16px 0" }}>
            <strong>{m.name}</strong> ({m.email}) — {roleNames[m.role]}
            {lead && <label> 역할 <select aria-label={`${m.email} 역할`} value={m.role} disabled={busy || lastLead} onChange={e => {
              const role = e.target.value;
              if (m.memberId !== member?.id || window.confirm("내 리더 권한을 변경하시겠습니까?")) mutate(() => AxiosApi.memberRole(id, m.memberId, role));
            }}>{Object.entries(roleNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>}
            {lastLead && <span> (마지막 리더)</span>}
            {canRemove && <button disabled={busy} aria-label={`${m.email} 제거`} onClick={() => {
              if (window.confirm(`${m.name}님을 프로젝트에서 제거하시겠습니까?`)) mutate(() => AxiosApi.memberRemove(id, m.memberId));
            }}>제거</button>}
          </li>;
        })}</ul>
      </section>
    </>}
    <button type="button" onClick={() => navigate("/projects")}>목록으로</button>
  </main>;
}
