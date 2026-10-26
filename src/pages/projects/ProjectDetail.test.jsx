import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { beforeEach, expect, test, vi } from "vitest";
import ProjectDetail from "./ProjectDetail";
import AxiosApi from "../../api/AxiosApi";
vi.mock("../../api/AxiosApi", () => ({ default: {
  projectDetail: vi.fn(), projectMembers: vi.fn(), memberAdd: vi.fn(), memberRole: vi.fn(),
  memberRemove: vi.fn(), projectUpdate: vi.fn(), projectDelete: vi.fn(),
} }));
vi.mock("../../auth/useAuth", () => ({ useAuth: () => ({ member: { id: 1 } }) }));
let role, team;
beforeEach(() => {
  vi.resetAllMocks();
  role = "LEAD";
  team = [{ memberId: 1, email: "lead@test.com", name: "리더", role: "LEAD" },
    { memberId: 2, email: "co@test.com", name: "공동", role: "CO_MANAGER" },
    { memberId: 3, email: "member@test.com", name: "팀원", role: "MEMBER" }];
  AxiosApi.projectDetail.mockImplementation(async () => ({ data: { name: "테스트", myRole: role } }));
  AxiosApi.projectMembers.mockImplementation(async () => ({ data: team }));
  vi.spyOn(window, "confirm").mockReturnValue(true);
});
async function open() {
  render(<MemoryRouter initialEntries={["/projects/7"]}><Routes><Route path="/projects/:id" element={<ProjectDetail />} /></Routes></MemoryRouter>);
  await screen.findByRole("heading", { name: "프로젝트 팀원" });
  return userEvent.setup();
}
test("MEMBER has read-only project and team", async () => {
  role = "MEMBER"; await open();
  expect(screen.getByLabelText("프로젝트 이름")).toBeDisabled();
  expect(screen.queryByRole("button", { name: "수정" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "팀원 추가" })).not.toBeInTheDocument();
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /제거/ })).not.toBeInTheDocument();
});
test("CO_MANAGER edits and removes only ordinary members", async () => {
  role = "CO_MANAGER"; const user = await open();
  expect(screen.getByRole("button", { name: "수정" })).toBeEnabled();
  expect(screen.queryByRole("button", { name: "프로젝트 삭제" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "co@test.com 제거" })).not.toBeInTheDocument();
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  AxiosApi.memberRemove.mockImplementation(async () => { team = team.filter(m => m.memberId !== 3); });
  await user.click(screen.getByRole("button", { name: "member@test.com 제거" }));
  await waitFor(() => expect(AxiosApi.memberRemove).toHaveBeenCalledWith("7", 3));
  await waitFor(() => expect(screen.queryByText(/member@test.com/)).not.toBeInTheDocument());
});
test("adds a member by email and refreshes team", async () => {
  const user = await open();
  AxiosApi.memberAdd.mockImplementation(async () => { team = [...team, { memberId: 4, email: "new@test.com", name: "신규", role: "MEMBER" }]; });
  await user.type(screen.getByLabelText("가입된 회원 이메일"), "new@test.com");
  await user.click(screen.getByRole("button", { name: "팀원 추가" }));
  await waitFor(() => expect(AxiosApi.memberAdd).toHaveBeenCalledWith("7", "new@test.com"));
  expect(await screen.findByText("신규")).toBeInTheDocument();
});
test("last lead and self-removal are disabled", async () => {
  await open();
  expect(screen.getByRole("combobox", { name: "lead@test.com 역할" })).toBeDisabled();
  expect(screen.queryByRole("button", { name: "lead@test.com 제거" })).not.toBeInTheDocument();
});
test("self demotion refreshes permissions", async () => {
  team[1].role = "LEAD";
  const user = await open();
  AxiosApi.memberRole.mockImplementation(async () => { role = "MEMBER"; team[0].role = "MEMBER"; });
  await user.selectOptions(screen.getByRole("combobox", { name: "lead@test.com 역할" }), "MEMBER");
  await waitFor(() => expect(AxiosApi.memberRole).toHaveBeenCalledWith("7", 1, "MEMBER"));
  await waitFor(() => expect(screen.queryByRole("button", { name: "프로젝트 삭제" })).not.toBeInTheDocument());
  expect(screen.queryByRole("button", { name: "팀원 추가" })).not.toBeInTheDocument();
});
test("duplicate conflict is visible and controls recover", async () => {
  const user = await open();
  AxiosApi.memberAdd.mockRejectedValue({ response: { status: 409 } });
  await user.type(screen.getByLabelText("가입된 회원 이메일"), "co@test.com");
  await user.click(screen.getByRole("button", { name: "팀원 추가" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("이미 참여 중");
  expect(await screen.findByRole("button", { name: "팀원 추가" })).toBeEnabled();
});
test("failed initial load exposes retry", async () => {
  AxiosApi.projectDetail.mockRejectedValueOnce({ response: { status: 404 } });
  render(<MemoryRouter initialEntries={["/projects/7"]}><Routes><Route path="/projects/:id" element={<ProjectDetail />} /></Routes></MemoryRouter>);
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: "다시 불러오기" }));
  expect(await screen.findByRole("heading", { name: "프로젝트 팀원" })).toBeInTheDocument();
});
