import { useEffect, useMemo, useState } from "react";
import AppShell from "../../components/AppShell";
import { invest } from "../../services/accountService";
import { sendNotification } from "../../services/notificationService";
import { syncCustomerBankingState } from "../../services/syncService";
import { getErrorMessage, getSession } from "../../utils/api";
import {
  formatCurrency,
  getAccountRestrictionMessage,
  isAccountOperational,
  normalizeAccountStatus,
  toPositiveNumber,
} from "../../utils/banking";

const plans = [
  { title: "Fixed Deposit", note: "Secure medium-term wealth growth." },
  { title: "Recurring Deposit", note: "Monthly disciplined savings plan." },
  { title: "Loan Repayment", note: "Allocate funds toward future EMI stability." },
];

function Investments() {
  const session = getSession();
  const userId = session?.userId || session?.id || "";
  const [accountId, setAccountId] = useState(session?.accountId || session?.account?.accountId || "");
  const [accountNumber, setAccountNumber] = useState(
    session?.accountNumber || session?.account?.accountNumber || "",
  );
  const [accountStatus, setAccountStatus] = useState(
    session?.accountStatus || session?.account?.status || "",
  );
  const [form, setForm] = useState({
    category: plans[0].title,
    amount: "",
    schedule: "Monthly",
    duration: "",
  });
  const [entries, setEntries] = useState([]);
  const [balance, setBalance] = useState(Number(session?.balance ?? session?.account?.balance ?? 0));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const totalAllocated = useMemo(() => entries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0), [entries]);

  const refreshData = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const snapshot = await syncCustomerBankingState({ userId, accountId: accountId || undefined });
      setAccountId(snapshot.account?.accountId || "");
      setAccountNumber(snapshot.account?.accountNumber || "");
      setAccountStatus(snapshot.account?.status || "");
      setBalance(Number(snapshot.balance || 0));
      setEntries(snapshot.investments || []);
      if (!snapshot.account) {
        setMessage("No linked account was found for this customer yet.");
      } else {
        setMessage(getAccountRestrictionMessage(snapshot.account));
      }
    } catch (error) {
      setMessage(getErrorMessage(error, "Could not load investment data."));
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    refreshData();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const parsedAmount = toPositiveNumber(form.amount);
    const parsedDuration = Number(form.duration);
    const normalizedStatus = normalizeAccountStatus(accountStatus);

    if (!accountId) {
      setMessage("A linked account is required before investing.");
      return;
    }

    if (!isAccountOperational(normalizedStatus)) {
      setMessage(getAccountRestrictionMessage(normalizedStatus));
      return;
    }

    if (!form.category) {
      setMessage("Select an investment type.");
      return;
    }

    if (!Number.isFinite(parsedAmount)) {
      setMessage("Investment amount must be numeric.");
      return;
    }

    if (parsedAmount <= 0) {
      setMessage("Investment amount must be greater than zero.");
      return;
    }

    if (parsedAmount > balance) {
      setMessage("Investment amount cannot exceed available balance.");
      return;
    }

    if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) {
      setMessage("Enter a valid investment duration in months.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const res = await invest({
        accountId: Number(accountId),
        amount: parsedAmount,
        category: form.category,
        duration: parsedDuration,
        schedule: form.schedule,
      });
      const nextBalance = Number(res?.data?.account?.balance || 0);

      if (userId && nextBalance === 0) {
        await sendNotification({
          userId,
          title: "Balance Alert",
          message: "Your account balance has reached zero after an investment allocation.",
        }).catch(() => null);
      }

      await refreshData({ silent: true });
      setMessage(res?.data?.message || "Investment recorded successfully.");
      setForm((current) => ({ ...current, amount: "", duration: "" }));
    } catch (error) {
      setMessage(getErrorMessage(error, "Investment could not be recorded."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Grow your wealth with secure investment opportunities." subtitle="Allocate funds into fixed deposits, recurring deposits, and loan investments.">
      <section className="grid-cards mt-4">
        {plans.map((plan) => (
          <article key={plan.title} className="surface-card metric-card">
            <span className="eyebrow">Investment Category</span>
            <h3>{plan.title}</h3>
            <p className="mb-0">{plan.note}</p>
          </article>
        ))}
        <article className="surface-card metric-card">
          <span className="eyebrow">Available Balance</span>
          <h3>{formatCurrency(balance)}</h3>
          <p className="mb-0">Validated against the latest account state before every allocation.</p>
        </article>
        <article className="surface-card metric-card">
          <span className="eyebrow">Linked Account Number</span>
          <h3>{accountNumber || "Not linked"}</h3>
          <p className="mb-0">Investments are posted against your active account number.</p>
        </article>
        <article className="surface-card metric-card">
          <span className="eyebrow">Account Status</span>
          <h3>{accountId ? normalizeAccountStatus(accountStatus).replace("_", " ") : "NOT LINKED"}</h3>
          <p className="mb-0">Investments are enabled only for active KYC-approved accounts.</p>
        </article>
      </section>

      {message ? <div className="alert alert-info mt-4 mb-0">{message}</div> : null}

      <section className="row g-4 mt-1">
        <div className="col-lg-5">
          <article className="surface-card h-100">
            <span className="eyebrow">Allocation Form</span>
            <h2>Invest from account funds</h2>
            <form className="form-stack mt-3" onSubmit={handleSubmit}>
              <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {plans.map((plan) => <option key={plan.title}>{plan.title}</option>)}
              </select>
              <input className="form-control" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              <input className="form-control" placeholder="Duration in months" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              <select className="form-select" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })}>
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>One Time</option>
              </select>
              <button className="btn btn-primary" disabled={loading || !isAccountOperational(accountStatus)}>{loading ? "Saving..." : "Add Investment Transfer"}</button>
            </form>
          </article>
        </div>
        <div className="col-lg-7">
          <article className="surface-card h-100">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Investment Ledger</span>
                <h2>Current allocations</h2>
              </div>
              <span className="status-badge">{formatCurrency(totalAllocated)}</span>
            </div>
            <div className="table-responsive">
              <table className="table modern-table align-middle mb-0">
                <thead><tr><th>ID</th><th>Category</th><th>Amount</th><th>Schedule</th><th>Duration</th></tr></thead>
                <tbody>
                  {entries.length > 0 ? entries.map((entry) => (
                    <tr key={entry.id}><td className="metric-code">{entry.id}</td><td>{entry.category}</td><td>{formatCurrency(entry.amount)}</td><td>{entry.schedule}</td><td>{entry.duration || "-"} months</td></tr>
                  )) : <tr><td colSpan="5" className="text-center text-muted py-4">No investment entries yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>
    </AppShell>
  );
}

export default Investments;
