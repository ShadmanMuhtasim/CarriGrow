import { api } from "./api";

export async function getMe() {
  const { data } = await api.get("/users/me");
  return data;
}

export async function updateMe(payload: Record<string, any>) {
  const { data } = await api.put("/users/me", payload);
  return data;
}

export async function setMySkills(skill_ids: number[]) {
  const { data } = await api.post("/users/me/skills", { skill_ids });
  return data;
}