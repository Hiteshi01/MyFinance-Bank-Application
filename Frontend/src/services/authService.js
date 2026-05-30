import { adminApi, authApi } from "../utils/api";

export const registerCustomer = (payload) => authApi.post("/register", payload);

export const loginCustomer = (payload) => authApi.post("/login", payload);

export const registerAdmin = (payload) => adminApi.post("/register", payload);

export const loginAdmin = (payload) => adminApi.post("/login", payload);

export const getAllCustomers = () => authApi.get("/all");

export const customerRegister = registerCustomer;
export const customerLogin = loginCustomer;
export const adminRegister = registerAdmin;
export const adminLogin = loginAdmin;
