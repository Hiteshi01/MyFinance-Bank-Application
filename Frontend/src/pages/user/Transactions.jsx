import { useEffect, useMemo, useState } from "react";
import AppShell from "../../components/AppShell";
import { deposit, getAccountByNumber, transfer, withdraw } from "../../services/accountService";
import { sendNotification } from "../../services/notificationService";
import { syncCustomerBankingState } from "../../services/syncService";
import { getErrorMessage, getSession } from "../../utils/api";
import {
  createReference,
  formatCurrency,
  formatDateTime,
  getAccountRestrictionMessage,
  isAccountOperational,
  normalizeAccountStatus,
  toPositiveNumber,
} from "../../utils/banking";

function Transactions() {
  const session = getSession();
  const userId = session?.userId || session?.id || "";
  const [accountId, setAccountId] = useState(session?.accountId || session?.account?.accountId || "");
  const [accountNumber, setAccountNumber] = useState(
    session?.accountNumber || session?.account?.accountNumber || "",
  );
  const [accountStatus, setAccountStatus] = useState(
    session?.accountStatus || session?.account?.status || "",
  );
  const [amount, setAmount] = useState("");
  const [transferForm, setTransferForm] = useState({
    fromAccountNumber: session?.accountNumber || session?.account?.accountNumber || "",
    toAccountNumber: "",
    amount: "",
  });
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(Number(session?.balance ?? session?.account?.balance ?? 0));
  const [latestReference, setLatestReference] = useState("No transaction yet");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const currentBalance = useMemo(() => Number(balance || 0), [balance]);

  const refreshData = async ({ silent = false, preferredAccountId } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const snapshot = await syncCustomerBankingState({
        userId,
        accountId: preferredAccountId || accountId || undefined,
      });
      const resolvedAccountId = String(snapshot.account?.accountId || preferredAccountId || "");
      const resolvedAccountNumber = snapshot.account?.accountNumber || "";

      setAccountId(resolvedAccountId);
      setAccountNumber(resolvedAccountNumber);
      setAccountStatus(snapshot.account?.status || "");
      setTransactions(snapshot.transactions || []);
      setBalance(Number(snapshot.balance || 0));
      setTransferForm((current) => ({
        ...current,
        fromAccountNumber: resolvedAccountNumber || current.fromAccountNumber,
      }));
      if (!snapshot.account) {
        setMessage("No linked account was found for this customer yet.");
      } else {
        setMessage(getAccountRestrictionMessage(snapshot.account));
      }
    } catch (error) {
      setMessage(getErrorMessage(error, "Could not refresh account data."));
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    refreshData();
  }, [userId]);

  const createZeroBalanceNotification = async (nextBalance) => {
    if (!userId || Number(nextBalance) !== 0) {
      return;
    }

    await sendNotification({
      userId,
      title: "Balance Alert",
      message: "Your account balance has reached zero.",
    }).catch(() => null);
  };

  const handleBalanceAction = async (mode) => {
    if (loading) return;

    const parsedAmount = toPositiveNumber(amount);
    const normalizedStatus = normalizeAccountStatus(accountStatus);

    if (!accountId) {
      setMessage("A valid linked account is required.");
      return;
    }

    if (!isAccountOperational(normalizedStatus)) {
      setMessage(getAccountRestrictionMessage(normalizedStatus));
      return;
    }

    if (!Number.isFinite(parsedAmount)) {
      setMessage("Amount must be numeric.");
      return;
    }

    if (parsedAmount <= 0) {
      setMessage("Amount must be greater than zero.");
      return;
    }

    if (mode === "withdraw" && parsedAmount > currentBalance) {
      setMessage("Insufficient balance.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const res = mode === "deposit"
        ? await deposit(accountId, parsedAmount)
        : await withdraw(accountId, parsedAmount);
      const transactionId = res?.data?.transactionId || createReference("TXN");
      const nextBalance = Number(res?.data?.account?.balance || 0);

      setLatestReference(transactionId);
      setBalance(nextBalance);
      setAmount("");
      await createZeroBalanceNotification(nextBalance);
      await refreshData({ silent: true, preferredAccountId: accountId });
      setMessage(res?.data?.message || `${mode === "deposit" ? "Deposit" : "Withdrawal"} completed successfully.`);
    } catch (error) {
      setMessage(
        getErrorMessage(
          error,
          `${mode === "deposit" ? "Deposit" : "Withdrawal"} could not be processed.`,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (loading) return;

    const parsedAmount = toPositiveNumber(transferForm.amount);
    const fromNumber = String(transferForm.fromAccountNumber || "").trim().toUpperCase();
    const toNumber = String(transferForm.toAccountNumber || "").trim().toUpperCase();
    const normalizedStatus = normalizeAccountStatus(accountStatus);

    if (!fromNumber || !toNumber) {
      setMessage("Sender and receiver account numbers are required.");
      return;
    }

    if (!isAccountOperational(normalizedStatus)) {
      setMessage(getAccountRestrictionMessage(normalizedStatus));
      return;
    }

    if (!Number.isFinite(parsedAmount)) {
      setMessage("Transfer amount must be numeric.");
      return;
    }

    if (parsedAmount <= 0) {
      setMessage("Transfer amount must be greater than zero.");
      return;
    }

    if (fromNumber === toNumber) {
      setMessage("Sender and receiver accounts must be different.");
      return;
    }

    if (accountNumber && fromNumber !== String(accountNumber).toUpperCase()) {
      setMessage("Sender account number must match your linked account.");
      return;
    }

    if (parsedAmount > currentBalance) {
      setMessage("Insufficient balance.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const [senderRes, receiverRes] = await Promise.all([
        getAccountByNumber(fromNumber),
        getAccountByNumber(toNumber),
      ]);

      const senderAccount = senderRes?.data;
      const receiverAccount = receiverRes?.data;

      if (!senderAccount?.accountId || !receiverAccount?.accountId) {
        setMessage("Unable to resolve account numbers for transfer.");
        return;
      }

      if (String(senderAccount.accountId) !== String(accountId)) {
        setMessage("Sender account number must map to your active account.");
        return;
      }

      const res = await transfer({
        fromAccountId: Number(senderAccount.accountId),
        toAccountId: Number(receiverAccount.accountId),
        amount: parsedAmount,
      });
      const nextBalance = Number(res?.data?.senderAccount?.balance || 0);

      setLatestReference(res?.data?.transactionId || createReference("TXN"));
      setBalance(nextBalance);
      setTransferForm({
        fromAccountNumber: senderAccount.accountNumber || fromNumber,
        toAccountNumber: "",
        amount: "",
      });
      await createZeroBalanceNotification(nextBalance);
      await refreshData({ silent: true, preferredAccountId: senderAccount.accountId });
      setMessage(res?.data?.message || "Transfer completed successfully.");
    } catch (error) {
      setMessage(getErrorMessage(error, "Transfer request failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="Move money securely and manage transactions with confidence."
      subtitle="Deposit, withdraw, and transfer funds with real-time tracking."
      actions={<button className="btn btn-outline-primary" onClick={() => refreshData()} disabled={loading}>{loading ? "Refreshing..." : "Refresh Transactions"}</button>}
    >
      <section className="grid-cards mt-4">
        <article className="surface-card metric-card"><span className="eyebrow">Latest Transaction ID</span><h3 className="metric-code">{latestReference}</h3><p className="mb-0">Every transaction is securely recorded for complete financial transparency.</p></article>
        <article className="surface-card metric-card"><span className="eyebrow">Account Number</span><h3>{accountNumber || "No account selected"}</h3><p className="mb-0">Transaction list is reloaded from Account Service after every operation.</p></article>
        <article className="surface-card metric-card"><span className="eyebrow">Account Status</span><h3>{accountId ? normalizeAccountStatus(accountStatus).replace("_", " ") : "NOT LINKED"}</h3><p className="mb-0">Only active accounts can perform banking transactions.</p></article>
        <article className="surface-card metric-card"><span className="eyebrow">Current Balance</span><h3>{formatCurrency(currentBalance)}</h3><p className="mb-0">Validated before withdraw and transfer requests.</p></article>
      </section>

      {message ? <div className="alert alert-info mt-4 mb-0">{message}</div> : null}

      <section className="row g-4 mt-1">
        <div className="col-xl-4">
          <article className="surface-card h-100">
            <span className="eyebrow">Balance Actions</span>
            <h2>Deposit or withdraw</h2>
            <div className="form-stack mt-3">
              <input className="form-control" placeholder="Linked Account Number" value={accountNumber} readOnly />
              <input className="form-control" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-success" onClick={() => handleBalanceAction("deposit")} disabled={loading || !isAccountOperational(accountStatus)}>Deposit</button>
                <button className="btn btn-outline-danger" onClick={() => handleBalanceAction("withdraw")} disabled={loading || !isAccountOperational(accountStatus)}>Withdraw</button>
              </div>
            </div>
          </article>
        </div>

        <div className="col-xl-4">
          <article className="surface-card h-100">
            <span className="eyebrow">Fund Transfer</span>
            <h2>Transfer between account numbers</h2>
            <form className="form-stack mt-3" onSubmit={handleTransfer}>
              <input className="form-control" placeholder="From Account Number" value={transferForm.fromAccountNumber} onChange={(e) => setTransferForm({ ...transferForm, fromAccountNumber: e.target.value })} />
              <input className="form-control" placeholder="To Account Number" value={transferForm.toAccountNumber} onChange={(e) => setTransferForm({ ...transferForm, toAccountNumber: e.target.value })} />
              <input className="form-control" placeholder="Amount" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} />
              <button className="btn btn-primary" disabled={loading || !isAccountOperational(accountStatus)}>{loading ? "Processing..." : "Transfer Funds"}</button>
            </form>
          </article>
        </div>

        <div className="col-xl-4">
          <article className="surface-card h-100">
            <span className="eyebrow">MyFin Highlights</span>
            <h2>Secure banking features you can trust</h2>
            <ul className="simple-list mb-0 mt-3">
              <li>Instant balance refresh after every verified transaction</li>
              <li>Account number transfers validated before execution</li>
              <li>KYC-aware controls protect sensitive actions</li>
              <li>Real-time notifications keep you informed</li>
              <li>“Secure. Reliable. Trusted.”</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="surface-card mt-4">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Transaction List</span>
            <h2>Account transaction history</h2>
          </div>
          {loading ? <span className="badge text-bg-primary">Loading...</span> : null}
        </div>
        <div className="table-responsive">
          <table className="table modern-table align-middle mb-0">
            <thead><tr><th>ID</th><th>Type</th><th>Amount</th><th>Timestamp</th></tr></thead>
            <tbody>
              {transactions.length > 0 ? transactions.map((item) => (
                <tr key={item.transactionId || item.id}>
                  <td className="metric-code">{item.transactionId || item.id || createReference("TXN")}</td>
                  <td>{item.type || item.transactionType || "Transaction"}</td>
                  <td>{formatCurrency(item.amount)}</td>
                  <td>{formatDateTime(item.createdAt || item.timestamp)}</td>
                </tr>
              )) : <tr><td colSpan="4" className="text-center text-muted py-4">No transaction history loaded.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

export default Transactions;
