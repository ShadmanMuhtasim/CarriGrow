import { api } from "./api";
import type { Skill } from "../types/models";

export async function listSkills() {
  const { data } = await api.get("/skills");
  return data as { skills: Skill[] };
}
