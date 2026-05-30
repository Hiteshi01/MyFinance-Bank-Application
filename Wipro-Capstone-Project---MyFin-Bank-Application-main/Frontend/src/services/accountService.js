import { accountApi } from "../utils/api";

export const createAccount = (payload) => accountApi.post("/create", payload);

export const getAccount = (accountId) => accountApi.get(`/${accountId}`);

export const getAccountByUserId = (userId) => accountApi.get(`/user/${userId}`);

export const getAccountByNumber = (accountNumber) =>
  accountApi.get(`/number/${accountNumber}`);

export const getAllAccounts = () => accountApi.get("/all");

export const approveAccountKyc = (accountId) =>
  accountApi.put(`/kyc/approve/${accountId}`);

export const deactivateAccount = (accountId) =>
  accountApi.put(`/deactivate/${accountId}`);

export const activateAccount = (accountId) =>
  accountApi.put(`/activate/${accountId}`);

export const deposit = (accountId, amount) =>
  accountApi.post(`/deposit/${accountId}/${amount}`);

export const withdraw = (accountId, amount) =>
  accountApi.post(`/withdraw/${accountId}/${amount}`);

export const transfer = (payload) => accountApi.post("/transfer", payload);

export const invest = (payload) => accountApi.post("/invest", payload);

export const getTransactions = (accountId) =>
  accountApi.get(`/transactions/${accountId}`);

export const depositMoney = deposit;
export const withdrawMoney = withdraw;
export const transferMoney = transfer;
