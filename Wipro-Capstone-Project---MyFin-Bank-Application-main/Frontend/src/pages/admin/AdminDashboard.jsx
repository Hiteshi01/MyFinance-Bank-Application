import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../../components/AppShell";
import ProfileCard from "../../components/ProfileCard";
import { getAllCustomers } from "../../services/authService";
import { getAllAccounts } from "../../services/accountService";
import { syncAdminMetrics, syncCustomerBankingState } from "../../services/syncService";
import { getErrorMessage, getSession } from "../../utils/api";
import { formatCurrency } from "../../utils/banking";

function AdminDashboard() {
  const session = getSession();
  const [metrics, setMetrics] = useState({ customers: 0, loans: 0, messages: 0, notifications: 0 });
  const [loading, setLoading] = useState(false);
  const [customerBalance, setCustomerBalance] = useState(0);
  const [message, setMessage] = useState("");

  const loadMetrics = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      await syncCustomerBankingState().catch(() => null);
      const syncState = await syncAdminMetrics();
      const customerRes = await getAllCustomers().catch(() => ({ data: [] }));
      const allCustomers = Array.isArray(customerRes.data) ? customerRes.data : [];
      const accountRes = await getAllAccounts().catch(() => ({ data: [] }));
      const allAccounts = Array.isArray(accountRes.data) ? accountRes.data : [];

      setCustomerBalance(
        allAccounts.reduce((sum, account) => sum + Number(account.balance || 0), 0),
      );
      setMetrics({
        customers: allCustomers.length,
        loans: syncState.loans.length,
        messages: syncState.messages.length,
        notifications: syncState.notifications.length,
      });
      if (!silent) {
        setMessage("");
      }
    } catch (error) {
      setMessage(getErrorMessage(error, "Could not load admin metrics."));
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadMetrics();
    const intervalId = window.setInterval(() => {
      loadMetrics({ silent: true });
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <AppShell
      title="Administrative control center for MyFin Bank."
      subtitle="Manage customers, review loan requests, and oversee system activity."
      actions={<button className="btn btn-outline-primary" onClick={() => loadMetrics()} disabled={loading}>{loading ? "Refreshing..." : "Refresh Metrics"}</button>}
    >
      {message ? <div className="alert alert-info mt-4 mb-0">{message}</div> : null}
      <section className="grid-cards mt-4">
        <article className="surface-card metric-card"><span className="eyebrow">Customers</span><h3>{metrics.customers}</h3><p className="mb-0">Aligned with real-time registrations stored in the database.</p></article>
        <article className="surface-card metric-card"><span className="eyebrow">Loan Requests</span><h3>{metrics.loans}</h3><p className="mb-0">Loan approvals stay aligned with real-time application activity.</p></article>
        <article className="surface-card metric-card"><span className="eyebrow">Support Messages</span><h3>{metrics.messages}</h3><p className="mb-0">Support conversations are monitored for timely responses.</p></article>
        <article className="surface-card metric-card"><span className="eyebrow">Notifications</span><h3>{metrics.notifications}</h3><p className="mb-0">Alerts update instantly as customer activity changes.</p></article>
      </section>

      <section className="row g-4 mt-1">
        <div className="col-lg-8">
          <article className="surface-card h-100">
            <div className="section-heading"><div><span className="eyebrow">Admin Modules</span><h2>Operations workspace</h2></div></div>
            <div className="feature-grid feature-grid-wide">
              <Link to="/loan-approval" className="feature-link"><div className="feature-card"><strong>Loan Approval</strong><p className="mb-0">Approve or decline applications with verified customer context.</p></div></Link>
              <Link to="/customer-management" className="feature-link"><div className="feature-card"><strong>Customer Management</strong><p className="mb-0">Review customer profiles, KYC status, and account standing.</p></div></Link>
              <Link to="/admin-chat" className="feature-link"><div className="feature-card"><strong>Admin Chat</strong><p className="mb-0">Provide timely responses and resolve customer inquiries.</p></div></Link>
            </div>
          </article>
        </div>
        <div className="col-lg-4">
          <article className="surface-card h-100">
            <span className="eyebrow">Admin Use Cases</span>
            <h2>Operational priorities</h2>
            <p className="text-muted mb-2">
              Oversee approvals, compliance, and customer assistance without delay.
            </p>
            <ul className="simple-list mb-0 mt-3">
              <li>Approve or deactivate customer accounts</li>
              <li>Review loan applications and risk signals</li>
              <li>Respond to support requests quickly</li>
              <li>Track notifications and service health</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="row g-4 mt-1">
        <div className="col-lg-6">
          <ProfileCard
            userId={session?.adminId || session?.id}
            adminCode={session?.adminCode}
            name={session?.name || "Administrator"}
            email={session?.email}
            status="Active"
            totalBalance={customerBalance}
            role="admin"
          />
        </div>
        <div className="col-lg-6">
          <article className="surface-card h-100">
            <span className="eyebrow">Managed Balance</span>
            <h2>{formatCurrency(customerBalance)}</h2>
            <p className="mb-0">
              Combined balance across all active customer accounts in the database.
            </p>
          </article>
        </div>
      </section>
    </AppShell>
  );
}

export default AdminDashboard;
