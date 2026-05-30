import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AboutSection from "../../components/AboutSection";
import AppShell from "../../components/AppShell";
import ProfileCard from "../../components/ProfileCard";
import { syncCustomerBankingState } from "../../services/syncService";
import { getErrorMessage, getSession } from "../../utils/api";
import {
  ACCOUNT_STATUS,
  createReference,
  formatCurrency,
  formatDateTime,
  getAccountRestrictionMessage,
  getBankingState,
  normalizeAccountStatus,
  subscribeToBankingState,
} from "../../utils/banking";

const quickLinks = [
  {
    title: "Move Money",
    description: "Deposit, withdraw, and transfer funds with verified processing.",
    to: "/transactions",
  },
  {
    title: "Investments",
    description: "Grow savings with secure, bank-approved investment options.",
    to: "/investments",
  },
  {
    title: "Loan Center",
    description: "Apply for loans and track decisions with full transparency.",
    to: "/loan",
  },
  {
    title: "Support Chat",
    description: "Get quick help from banking specialists when you need it.",
    to: "/chat",
  },
  {
    title: "Notifications",
    description: "Receive trusted alerts on balance, loans, and account activity.",
    to: "/notifications",
  },
];

function Dashboard() {
  const session = getSession();
  const userId = session?.userId || session?.id || "";
  const [accountId, setAccountId] = useState(session?.accountId || session?.account?.accountId || "");
  const [accountNumber, setAccountNumber] = useState(
    session?.accountNumber || session?.account?.accountNumber || "",
  );
  const [bankingState, setBankingState] = useState(getBankingState());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const refreshDashboard = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const snapshot = await syncCustomerBankingState({ userId });
      setBankingState(snapshot);
      setAccountId(snapshot.account?.accountId || "");
      setAccountNumber(snapshot.account?.accountNumber || "");
      if (!snapshot.account) {
        setMessage("No linked account was found for this customer yet.");
      } else {
        setMessage(getAccountRestrictionMessage(snapshot.account));
      }
    } catch (error) {
      setMessage(getErrorMessage(error, "Could not load dashboard data."));
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    refreshDashboard();
    const unsubscribe = subscribeToBankingState((nextState) => {
      if (isMounted) {
        setBankingState(nextState);
        setAccountId(nextState.account?.accountId || "");
        setAccountNumber(nextState.account?.accountNumber || "");
      }
    });
    const intervalId = window.setInterval(() => {
      refreshDashboard({ silent: true });
    }, 10000);

    return () => {
      isMounted = false;
      unsubscribe();
      window.clearInterval(intervalId);
    };
  }, [userId]);

  const activeTransactions = bankingState.transactions || [];
  const profileBalance = Number(bankingState.balance || 0);
  const accountStatus = normalizeAccountStatus(
    bankingState.account?.status || session?.accountStatus,
  );
  const profileStatus =
    !bankingState.account
      ? "Not Linked"
      : accountStatus === ACCOUNT_STATUS.DEACTIVATED
        ? "Deactivated"
        : accountStatus === ACCOUNT_STATUS.PENDING_KYC
          ? "KYC Pending"
          : "Active";
  const pendingLoans = useMemo(
    () =>
      (bankingState.loans || []).filter(
        (loan) => String(loan.status || "").toUpperCase() === "PENDING",
      ).length,
    [bankingState.loans],
  );
  const notificationCount = (bankingState.notifications || []).length;

  return (
    <AppShell
      title="Welcome back - your financial overview is ready."
      subtitle="Track balances, monitor transactions, and manage your financial activities in real time."
      actions={
        <button
          className="btn btn-outline-primary"
          onClick={() => refreshDashboard()}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Activity"}
        </button>
      }
    >
      {message ? (
        <div className="alert alert-info mt-4 mb-0">{message}</div>
      ) : null}
      <section className="grid-cards mt-4">
        <article className="surface-card metric-card">
          <span className="eyebrow">Customer</span>
          <h3>{session?.name || "MyFin User"}</h3>
          <p className="mb-0">Secure access confirms your identity before banking actions.</p>
        </article>
        <article className="surface-card metric-card">
          <span className="eyebrow">Account Number</span>
          <h3>{accountNumber || "Not linked"}</h3>
          <p className="mb-0">Status: {profileStatus}</p>
        </article>
        <article className="surface-card metric-card">
          <span className="eyebrow">Available Balance</span>
          <h3>{formatCurrency(profileBalance)}</h3>
          <p className="mb-0">Balances update immediately after every verified transaction.</p>
        </article>
        <article className="surface-card metric-card">
          <span className="eyebrow">Loan & Alerts</span>
          <h3>
            {pendingLoans} pending / {notificationCount} alerts
          </h3>
          <p className="mb-0">Loan decisions and alerts stay in sync with your account.</p>
        </article>
      </section>

      <section className="row g-4 mt-1">
        <div className="col-xl-8">
          <article className="surface-card h-100">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Customer Use Cases</span>
                <h2>Everyday banking actions</h2>
              </div>
            </div>
            <div className="feature-grid">
              {quickLinks.map((link) => (
                <Link key={link.to} to={link.to} className="feature-link">
                  <div className="feature-card">
                    <strong>{link.title}</strong>
                    <p className="mb-0">{link.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </article>
        </div>

        <div className="col-xl-4">
          <ProfileCard
            userId={session?.userId || session?.id || accountId}
            userCode={session?.userCode}
            accountNumber={accountNumber}
            name={session?.name || "MyFin User"}
            email={session?.email}
            status={profileStatus}
            totalBalance={profileBalance}
            role="customer"
          />
        </div>
      </section>

      <section className="mt-4">
        <AboutSection />
      </section>

      <section className="row g-4 mt-1">
        <div className="col-12">
          <article className="surface-card h-100">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Recent Transactions</span>
                <h2>Live activity overview</h2>
              </div>
              {loading ? (
                <span className="badge text-bg-primary">Loading...</span>
              ) : null}
            </div>
            <div className="table-responsive">
              <table className="table modern-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTransactions.length > 0 ? (
                    activeTransactions.slice(0, 5).map((item) => (
                      <tr key={item.transactionId || item.id}>
                        <td className="metric-code">
                          {item.transactionId ||
                            item.id ||
                            createReference("TXN")}
                        </td>
                        <td>
                          {item.type || item.transactionType || "Transaction"}
                        </td>
                        <td>{formatCurrency(item.amount)}</td>
                        <td>
                          {formatDateTime(item.createdAt || item.timestamp)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        No transactions available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>
    </AppShell>
  );
}

export default Dashboard;
