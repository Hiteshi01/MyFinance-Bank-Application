import { useEffect, useMemo, useState } from "react";
import AppShell from "../../components/AppShell";
import { applyLoan } from "../../services/loanService";
import { syncCustomerBankingState } from "../../services/syncService";
import { getErrorMessage, getSession } from "../../utils/api";
import {
  calculateEmi,
  formatCurrency,
  getAccountRestrictionMessage,
  isAccountOperational,
  normalizeAccountStatus,
  toPositiveNumber,
} from "../../utils/banking";

function LoanApplication() {
  const session = getSession();
  const userId = session?.userId || session?.id || "";
  const [accountNumber, setAccountNumber] = useState(
    session?.accountNumber || session?.account?.accountNumber || "Not linked",
  );
  const [accountStatus, setAccountStatus] = useState(
    session?.accountStatus || session?.account?.status || "",
  );
  const [form, setForm] = useState({
    userId,
    amount: "",
    duration: "",
    rate: "10.5",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [applications, setApplications] = useState([]);

  const emi = useMemo(
    () => calculateEmi(form.amount, form.rate, form.duration),
    [form.amount, form.rate, form.duration],
  );

  const refreshLoans = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const snapshot = await syncCustomerBankingState({ userId });
      setApplications(snapshot.loans || []);
      setAccountNumber(snapshot.account?.accountNumber || "Not linked");
      setAccountStatus(snapshot.account?.status || "");
      if (!snapshot.account) {
        setMessage("No linked account was found for this customer yet.");
      } else {
        setMessage(getAccountRestrictionMessage(snapshot.account));
      }
    } catch (error) {
      if (!silent) {
        setMessage(getErrorMessage(error, "Could not load loan applications."));
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    refreshLoans();
    const intervalId = window.setInterval(() => {
      refreshLoans({ silent: true });
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const amount = toPositiveNumber(form.amount);
    const duration = Number.parseInt(form.duration, 10);
    const rate = toPositiveNumber(form.rate);
    const targetUserId = String(form.userId || "").trim();
    const normalizedStatus = normalizeAccountStatus(accountStatus);

    if (!targetUserId) {
      setMessage("A valid customer ID is required before applying for a loan.");
      return;
    }

    if (!isAccountOperational(normalizedStatus)) {
      setMessage(getAccountRestrictionMessage(normalizedStatus));
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage("Loan amount must be greater than zero.");
      return;
    }

    if (!Number.isInteger(duration) || duration <= 0) {
      setMessage("Loan duration must be a valid number of months.");
      return;
    }

    if (!Number.isFinite(rate) || rate <= 0) {
      setMessage("Interest rate must be greater than zero.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await applyLoan({
        userId: Number(targetUserId),
        amount,
        duration,
        interestRate: rate,
      });
      await refreshLoans({ silent: true });
      setMessage(`Loan application submitted successfully. Reference: ${response?.data?.loanId || "PENDING"}`);
      setForm((current) => ({ ...current, amount: "", duration: "" }));
    } catch (error) {
      setMessage(
        getErrorMessage(
          error,
          "Loan application failed. Please review the details and try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="Flexible loan solutions designed for your financial goals."
      subtitle="Estimate EMI, apply for loans, and manage repayments easily."
    >
      {message ? <div className="alert alert-info mt-4 mb-0">{message}</div> : null}
      <section className="row g-4 mt-4">
        <div className="col-lg-6">
          <article className="surface-card h-100">
            <span className="eyebrow">Loan Form</span>
            <h2>Apply for a loan</h2>
            <form className="form-stack mt-3" onSubmit={handleSubmit} noValidate>
              <input
                className="form-control"
                placeholder="User ID"
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                required
              />
              <input
                className="form-control"
                type="number"
                min="1"
                step="0.01"
                placeholder="Loan amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
              <input
                className="form-control"
                type="number"
                min="1"
                step="1"
                placeholder="Duration in months"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                required
              />
              <input
                className="form-control"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Annual interest rate"
                value={form.rate}
                onChange={(e) => setForm({ ...form, rate: e.target.value })}
                required
              />
              <button className="btn btn-primary" disabled={loading || !isAccountOperational(accountStatus)}>
                {loading ? "Submitting..." : "Apply for Loan"}
              </button>
            </form>
          </article>
        </div>
        <div className="col-lg-6">
          <article className="surface-card h-100">
            <span className="eyebrow">EMI Calculator</span>
            <h2>Repayment preview</h2>
            <div className="stack-list mt-4">
              <div className="list-row">
                <div>
                  <strong>Estimated EMI</strong>
                  <p className="mb-0 text-muted">Monthly repayment based on your current values.</p>
                </div>
                <span className="amount-pill">{formatCurrency(emi)}</span>
              </div>
              <div className="list-row">
                <div>
                  <strong>Total payable</strong>
                  <p className="mb-0 text-muted">Estimated loan outflow across the full duration.</p>
                </div>
                <span className="amount-pill">
                  {formatCurrency(emi * Number(form.duration || 0))}
                </span>
              </div>
              <div className="list-row">
                <div>
                  <strong>Linked Account Number</strong>
                  <p className="mb-0 text-muted">Loan servicing maps to your primary banking account.</p>
                </div>
                <span className="amount-pill">{accountNumber}</span>
              </div>
              <div className="list-row">
                <div>
                  <strong>Loan status</strong>
                  <p className="mb-0 text-muted">Financial support when you need it most.</p>
                </div>
                <span className="status-badge">Pending</span>
              </div>
              <div className="list-row">
                <div>
                  <strong>Account status</strong>
                  <p className="mb-0 text-muted">Only active KYC-approved accounts can submit loan requests.</p>
                </div>
                <span className="status-badge">{accountNumber === "Not linked" ? "NOT LINKED" : normalizeAccountStatus(accountStatus).replace("_", " ")}</span>
              </div>
            </div>
          </article>
        </div>
      </section>
      <section className="surface-card mt-4">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Loan Requests</span>
            <h2>Submitted applications</h2>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table modern-table align-middle mb-0">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Amount</th>
                <th>Duration</th>
                <th>EMI</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.length > 0 ? (
                applications.map((app) => (
                  <tr key={app.loanId || app.id}>
                    <td className="metric-code">{app.loanId || app.id}</td>
                    <td>{formatCurrency(app.amount)}</td>
                    <td>{app.duration} months</td>
                    <td>{formatCurrency(app.emi)}</td>
                    <td>
                      <span className="status-badge">{app.status || "PENDING"}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No loans submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

export default LoanApplication;
