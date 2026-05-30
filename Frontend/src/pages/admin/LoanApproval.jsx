import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import { approveLoan, getLoans, rejectLoan } from "../../services/loanService";
import { syncAdminMetrics, syncCustomerBankingState } from "../../services/syncService";
import { getErrorMessage } from "../../utils/api";
import { formatCurrency } from "../../utils/banking";

function LoanApproval() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingLoanId, setProcessingLoanId] = useState(null);
  const [message, setMessage] = useState("");

  const loadLoans = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const res = await getLoans();
      setLoans(Array.isArray(res.data) ? res.data : []);
      if (!silent) {
        setMessage("");
      }
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to load loans right now."));
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadLoans();
    const intervalId = window.setInterval(() => {
      loadLoans({ silent: true });
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, []);

  const decide = async (loan, action) => {
    const id = loan?.loanId || loan?.id;
    if (!id || processingLoanId) {
      return;
    }

    try {
      setProcessingLoanId(id);
      setMessage("");
      if (action === "approve") {
        await approveLoan(id);
      } else {
        await rejectLoan(id);
      }

      await Promise.all([
        loadLoans({ silent: true }),
        syncAdminMetrics().catch(() => null),
        syncCustomerBankingState({ userId: loan?.userId || loan?.customerId }).catch(() => null),
      ]);
      setMessage(`Loan ${action === "approve" ? "approved" : "rejected"} successfully.`);
    } catch (error) {
      setMessage(getErrorMessage(error, `Loan ${action} request failed.`));
    } finally {
      setProcessingLoanId(null);
    }
  };

  return (
    <AppShell
      title="Review and manage loan applications."
      subtitle="Approve or decline requests based on customer financial activity."
    >
      {message ? <div className="alert alert-info mt-4 mb-0">{message}</div> : null}
      <section className="surface-card mt-4">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Loan Queue</span>
            <h2>All applications</h2>
          </div>
          {loading ? <span className="badge text-bg-primary">Loading...</span> : null}
        </div>
        <div className="table-responsive">
          <table className="table modern-table align-middle mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Amount</th>
                <th>Duration</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.length > 0 ? (
                loans.map((loan) => {
                  const normalizedStatus = String(loan.status || "PENDING").toUpperCase();
                  const busy = processingLoanId === (loan.loanId || loan.id);

                  return (
                    <tr key={loan.loanId || loan.id}>
                      <td>{loan.loanId || loan.id}</td>
                      <td>{loan.userId || loan.customerId || "N/A"}</td>
                      <td>{formatCurrency(loan.amount)}</td>
                      <td>{loan.duration || "-"} months</td>
                      <td>
                        <span className="status-badge">{normalizedStatus}</span>
                      </td>
                      <td className="text-end d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => decide(loan, "approve")}
                          disabled={busy || normalizedStatus !== "PENDING"}
                        >
                          {busy ? "Working..." : "Approve"}
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => decide(loan, "reject")}
                          disabled={busy || normalizedStatus !== "PENDING"}
                        >
                          {busy ? "Working..." : "Reject"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No loan requests available.
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

export default LoanApproval;
