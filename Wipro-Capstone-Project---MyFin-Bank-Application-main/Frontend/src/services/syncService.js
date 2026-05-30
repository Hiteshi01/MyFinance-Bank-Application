import { createAccount, getAccount, getAccountByUserId, getTransactions } from "./accountService";
import { getLoans } from "./loanService";
import { getMessages } from "./chatService";
import { getNotifications } from "./notificationService";
import { getSession, mergeSession } from "../utils/api";
import { deriveInvestmentEntries, getBankingState, replaceBankingState, updateBankingState } from "../utils/banking";

const asList = (value) => (Array.isArray(value) ? value : []);

export const syncCustomerBankingState = async ({ userId, accountId } = {}) => {
  const session = getSession();
  if (!session) {
    const snapshot = replaceBankingState({});
    return snapshot;
  }

  const resolvedUserId = userId || session?.userId || session?.id || null;
  const shouldScopeByUser = session?.role === "customer";
  const ownerKey = `${session?.role || "unknown"}:${resolvedUserId || "anonymous"}`;
  const currentState = getBankingState();
  if (currentState.ownerKey && currentState.ownerKey !== ownerKey) {
    replaceBankingState({});
  }
  let resolvedAccountId = accountId || session?.accountId || session?.account?.accountId || null;

  let account = null;
  const fetchAccountIdByUser = async () => {
    const accountByUser = (await getAccountByUserId(resolvedUserId)).data;
    return accountByUser?.accountId || null;
  };

  if (!resolvedAccountId && resolvedUserId) {
    try {
      resolvedAccountId = await fetchAccountIdByUser();
    } catch {
      if (shouldScopeByUser) {
        try {
          const parsedUserId = Number(resolvedUserId);
          const createdAccount = (
            await createAccount({
              userId: Number.isFinite(parsedUserId) ? parsedUserId : resolvedUserId,
              accountType: "SAVINGS",
            })
          ).data;
          resolvedAccountId = createdAccount?.accountId || null;
        } catch {
          try {
            // Handles race cases where another flow created the account first.
            resolvedAccountId = await fetchAccountIdByUser();
          } catch {
            resolvedAccountId = null;
          }
        }
      } else {
        resolvedAccountId = null;
      }
    }
  }

  if (resolvedAccountId) {
    account = (await getAccount(resolvedAccountId)).data;
  }

  const [transactionRes, loanRes, notificationRes, messageRes] =
    await Promise.all([
      account?.accountId
        ? getTransactions(account.accountId).catch(() => ({ data: [] }))
        : Promise.resolve({ data: [] }),
      getLoans().catch(() => ({ data: [] })),
      getNotifications().catch(() => ({ data: [] })),
      getMessages({}).catch(() => ({ data: [] })),
    ]);

  const transactions = asList(transactionRes.data);
  const allLoans = asList(loanRes.data);
  const allNotifications = asList(notificationRes.data);
  const allMessages = asList(messageRes.data);

  const loans =
    shouldScopeByUser && resolvedUserId
      ? allLoans.filter(
          (item) => String(item.userId || item.customerId || "") === String(resolvedUserId),
        )
      : allLoans;
  const notifications =
    shouldScopeByUser && resolvedUserId
      ? allNotifications.filter((item) => String(item.userId || "") === String(resolvedUserId))
      : allNotifications;
  const messages =
    shouldScopeByUser && resolvedUserId
      ? allMessages.filter(
          (item) =>
            String(item.senderId || "") === String(resolvedUserId) ||
            String(item.receiverId || "") === String(resolvedUserId),
        )
      : allMessages;

  const snapshot = {
    ownerKey,
    account,
    balance: Number(account?.balance || 0),
    transactions,
    investments: deriveInvestmentEntries(transactions),
    loans,
    notifications,
    messages,
  };

  replaceBankingState(snapshot);

  if (account) {
    mergeSession({
      accountId: account.accountId,
      accountNumber: account.accountNumber,
      accountStatus: account.status,
      balance: Number(account.balance || 0),
      account,
      userId: resolvedUserId || session?.userId || session?.id,
    });
  } else {
    mergeSession({
      accountId: null,
      accountNumber: null,
      accountStatus: null,
      balance: 0,
      account: null,
    });
  }

  return snapshot;
};

export const syncCustomerNotifications = async (userId) => {
  if (!userId) {
    updateBankingState((current) => ({ ...current, notifications: [] }));
    return [];
  }

  const snapshot = await syncCustomerBankingState({ userId });
  const rows = asList(snapshot.notifications);
  updateBankingState((current) => ({ ...current, notifications: rows }));
  return rows;
};

export const syncAdminMetrics = async () => {
  const [loanRes, messageRes, notificationRes] = await Promise.all([
    getLoans().catch(() => ({ data: [] })),
    getMessages().catch(() => ({ data: [] })),
    getNotifications().catch(() => ({ data: [] })),
  ]);

  return {
    loans: asList(loanRes.data),
    messages: asList(messageRes.data),
    notifications: asList(notificationRes.data),
  };
};
