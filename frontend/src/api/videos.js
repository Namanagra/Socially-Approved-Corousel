import axios from "axios";

const api = axios.create({
  baseURL: "https://socially-approved-corousel.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

export const fetchVideos = async () => {
  const res = await api.get("/videos");
  return res.data;
};

export const likeVideo = async (videoId) => {
  const userId = localStorage.getItem("userId") || generateUserId();
  const res = await api.post("/like", { videoId, userId });
  return res.data;
};

export const shareVideo = async (videoId, platform = "copy") => {
  const res = await api.post("/share", { videoId, platform });
  return res.data;
};

function generateUserId() {
  const id = "user_" + Math.random().toString(36).slice(2, 10);
  localStorage.setItem("userId", id);
  return id;
}