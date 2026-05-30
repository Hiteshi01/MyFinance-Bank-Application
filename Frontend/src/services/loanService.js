import { supportApi } from "../utils/api";

export const applyLoan = (payload) => supportApi.post("/loan/apply", payload);
export const getLoans = () => supportApi.get("/loan/all");
export const getLoansByUser = (userId) => supportApi.get(`/loan/user/${userId}`);
export const approveLoan = (id) => supportApi.put(`/loan/approve/${id}`);
export const rejectLoan = (id) => supportApi.put(`/loan/reject/${id}`);

export const getAllLoans = getLoans;
