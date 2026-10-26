import axios from "axios";
import { beforeEach, expect, test, vi } from "vitest";
let requests;
beforeEach(() => {
  vi.resetModules(); requests = [];
  axios.defaults.adapter = async config => {
    requests.push(config);
    return { config, status: 200, statusText: "OK", headers: {}, data:
      config.url === "/api/auth/csrf" ? { headerName: "X-CSRF-TOKEN", token: "fresh-token" } : {} };
  };
});
test("membership requests preserve API contract and fresh CSRF tokens", async () => {
  const { default: api } = await import("./AxiosApi");
  await api.projectMembers(7);
  await api.memberAdd(7, "member@test.com");
  await api.memberRole(7, 3, "CO_MANAGER");
  await api.memberRemove(7, 3);
  const calls = requests.filter(r => r.url !== "/api/auth/csrf");
  expect(calls.map(r => [r.method, r.url])).toEqual([
    ["get", "/api/projects/7/members"], ["post", "/api/projects/7/members"],
    ["put", "/api/projects/7/members/3/role"], ["delete", "/api/projects/7/members/3"],
  ]);
  expect(JSON.parse(calls[1].data)).toEqual({ email: "member@test.com" });
  expect(JSON.parse(calls[2].data)).toEqual({ role: "CO_MANAGER" });
  expect(requests.filter(r => r.url === "/api/auth/csrf")).toHaveLength(3);
  for (const call of calls) expect(call.withCredentials).toBe(true);
  for (const call of calls.slice(1)) expect(call.headers["X-CSRF-TOKEN"]).toBe("fresh-token");
});
