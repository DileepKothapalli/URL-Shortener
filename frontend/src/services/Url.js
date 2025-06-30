import { api } from "../api";

export const shorten = (longUrl) =>
  api.post("/urls/shorten", { longUrl }).then((r) => r.data);

export const myUrls = () => api.get("/urls/myUrls").then((r) => r.data);

export const stats = (code) => api.get(`/stats/${code}`).then((r) => r.data);
