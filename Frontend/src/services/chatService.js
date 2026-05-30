import { supportApi } from "../utils/api";

export const sendMessage = (payload) => supportApi.post("/api/chat/send", payload);
export const getMessages = (params) => supportApi.get("/api/chat/messages", { params });
//export const sendNotification = (payload) => supportApi.post("/notification/send", payload);
//export const getNotifications = () => supportApi.get("/notification/all");
