import { supportApi } from "../utils/api";

export const sendNotification = (payload) => supportApi.post("/notification/send", payload);
export const getNotifications = () => supportApi.get("/notification/all");
export const getNotificationsByUser = (userId) => supportApi.get(`/notification/user/${userId}`);
