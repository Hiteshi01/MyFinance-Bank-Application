export const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return `Rs. ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
};

export const BANKING_STATE_KEY = "myfin_banking_state";
export const BANKING_SYNC_EVENT = "myfin:banking-sync";
const EMPTY_BANKING_STATE = {
  ownerKey: null,
  balance: 0,
  account: null,
  transactions: [],
  investments: [],
  loans: [],
  notifications: [],
  messages: [],
};
let bankingState = { ...EMPTY_BANKING_STATE };

export const createReference = (prefix = "TXN") => {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${Date.now()}-${random}`;
};

export const ACCOUNT_STATUS = {
  PENDING_KYC: "PENDING_KYC",
  ACTIVE: "ACTIVE",
  DEACTIVATED: "DEACTIVATED",
};

export const calculateEmi = (principal, annualRate, months) => {
  const p = Number(principal || 0);
  const n = Number(months || 0);
  const r = Number(annualRate || 0) / 12 / 100;

  if (!p || !n) return 0;
  if (!r) return p / n;

  const numerator = p * r * (1 + r) ** n;
  const denominator = (1 + r) ** n - 1;

  return numerator / denominator;
};

export const formatDateTime = (value) => {
  if (!value) return "Just now";
  try {
    let date;
    if (Array.isArray(value) && value.length >= 5) {
      date = new Date(
        Number(value[0]),
        Number(value[1]) - 1,
        Number(value[2]),
        Number(value[3]),
        Number(value[4]),
        Number(value[5] || 0),
      );
    } else {
      date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    const datePart = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
    const timePart = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);

    return `${datePart} • ${timePart}`;
  } catch {
    return String(value);
  }
};

export const toPositiveNumber = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : NaN;
};

export const normalizeAccountStatus = (value) => {
  const normalized = String(value || "")
    .trim()
    .toUpperCase();
  if (normalized === ACCOUNT_STATUS.ACTIVE) return ACCOUNT_STATUS.ACTIVE;
  if (
    normalized === ACCOUNT_STATUS.DEACTIVATED ||
    normalized === "INACTIVE" ||
    normalized === "DEACTIVE"
  ) {
    return ACCOUNT_STATUS.DEACTIVATED;
  }
  if (
    normalized === ACCOUNT_STATUS.PENDING_KYC ||
    normalized === "PENDING" ||
    normalized === "KYC_PENDING"
  ) {
    return ACCOUNT_STATUS.PENDING_KYC;
  }
  return ACCOUNT_STATUS.PENDING_KYC;
};

export const getAccountRestrictionMessage = (accountOrStatus) => {
  const statusValue =
    typeof accountOrStatus === "string"
      ? accountOrStatus
      : accountOrStatus?.status || accountOrStatus?.accountStatus || "";
  const status = normalizeAccountStatus(statusValue);

  if (status === ACCOUNT_STATUS.PENDING_KYC) {
    return "Account needs the verification(KYC)";
  }

  if (status === ACCOUNT_STATUS.DEACTIVATED) {
    return "This account is deactivated by bank authority contact branch for it";
  }

  return "";
};

export const isAccountOperational = (accountOrStatus) =>
  normalizeAccountStatus(
    typeof accountOrStatus === "string"
      ? accountOrStatus
      : accountOrStatus?.status || accountOrStatus?.accountStatus,
  ) === ACCOUNT_STATUS.ACTIVE;

export const isPositiveNumber = (value) => Number.isFinite(value) && value > 0;

export const createBankingNotification = (title, message, type = "info") => ({
  id: createReference("NOTI"),
  title,
  message,
  type,
  createdAt: new Date().toISOString(),
});

const dispatchBankingState = (nextState) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(BANKING_SYNC_EVENT, { detail: nextState }),
    );
  }
};

const normalizeList = (value) => (Array.isArray(value) ? value : []);

export const getBankingState = () => bankingState;

export const replaceBankingState = (nextState = {}) => {
  bankingState = {
    ...EMPTY_BANKING_STATE,
    ...nextState,
    transactions: normalizeList(nextState.transactions),
    investments: normalizeList(nextState.investments),
    loans: normalizeList(nextState.loans),
    notifications: normalizeList(nextState.notifications),
    messages: normalizeList(nextState.messages),
  };
  dispatchBankingState(bankingState);
  return bankingState;
};

export const updateBankingState = (updater) => {
  const current = getBankingState();
  const next =
    typeof updater === "function"
      ? updater(current)
      : { ...current, ...updater };
  return replaceBankingState(next);
};

export const subscribeToBankingState = (callback) => {
  const handler = (event) => {
    callback(event.detail || getBankingState());
  };
  window.addEventListener(BANKING_SYNC_EVENT, handler);
  return () => window.removeEventListener(BANKING_SYNC_EVENT, handler);
};

export const deriveInvestmentEntries = (transactions = []) =>
  normalizeList(transactions)
    .filter((item) => String(item.type || "").toUpperCase() === "INVESTMENT")
    .map((item) => {
      const [
        category = "Investment",
        schedule = "One Time",
        durationText = "",
      ] = String(item.description || "")
        .split("|")
        .map((part) => part.trim());
      return {
        id: item.transactionId || item.id || createReference("INV"),
        category,
        schedule,
        duration: durationText.replace(/\s*months?$/i, ""),
        amount: Number(item.amount || 0),
        createdAt: item.createdAt || item.timestamp,
      };
    });
