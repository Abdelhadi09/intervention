import api from "../api/axios";

export async function getStructures() {
  const response = await api.get("/structures");
  return response.data;
}

export async function getNatures() {
  const response = await api.get("/natures");
  return response.data;
}
