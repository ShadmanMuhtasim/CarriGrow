import { api } from "./api";

export async function listSkills() {
  const { data } = await api.get("/skills");
  return data;
}