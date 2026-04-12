import { api } from "./api";

export interface RoadmapRequest {
  current_role: string;
  target_role: string;
  current_skills?: string[];
}

export interface RoadmapResponse {
  success: boolean;
  roadmap?: string;
  message?: string;
}

export async function generateAiRoadmap(payload: RoadmapRequest): Promise<RoadmapResponse> {
  const { data } = await api.post<RoadmapResponse>("/ai/roadmap", payload);
  return data;
}

