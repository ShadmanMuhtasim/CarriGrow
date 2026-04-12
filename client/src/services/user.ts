import { api } from "./api";
import type { ProficiencyLevel, Skill, User } from "../types/models";

export type SkillAssignment = {
  skill_id: number;
  proficiency_level: ProficiencyLevel;
};

export async function getMe() {
  const { data } = await api.get("/users/me");
  return data as { user: User };
}

export async function updateMe(payload: Record<string, unknown>) {
  const { data } = await api.put("/users/me", payload);
  return data as { message: string; user: User };
}

export async function deleteMyProfile() {
  const { data } = await api.delete("/users/me/profile");
  return data as { message: string; user: User };
}

export async function setMySkills(skills: SkillAssignment[]) {
  const { data } = await api.post("/users/me/skills", { skills });
  return data as { message: string; skills: Skill[] };
}

export async function getUserSkills(userId: number) {
  const { data } = await api.get(`/users/${userId}/skills`);
  return data as { user_id: number; skills: Skill[] };
}

export async function addUserSkill(userId: number, assignment: SkillAssignment) {
  const { data } = await api.post(`/users/${userId}/skills`, assignment);
  return data as { message: string; skills: Skill[] };
}

export async function removeUserSkill(userId: number, skillId: number) {
  const { data } = await api.delete(`/users/${userId}/skills/${skillId}`);
  return data as { message: string; skills: Skill[] };
}
