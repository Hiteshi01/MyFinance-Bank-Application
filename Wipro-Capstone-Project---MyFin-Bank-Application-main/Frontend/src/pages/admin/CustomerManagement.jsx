import { useEffect, useMemo, useState } from "react";
import AppShell from "../../components/AppShell";
import {
  activateAccount,
  approveAccountKyc,
  deactivateAccount,
  getAllAccounts,
} from "../../services/accountService";
import { getAllCustomers } from "../../services/authService";
import { getErrorMessage } from "../../utils/api";
import { formatCurrency, normalizeAccountStatus } from "../../utils/banking";

function CustomerManagement() {
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionKey, setActionKey] = useState("");
  const [message, setMessage] = useState("");

  const loadAccounts = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const response = await getAllAccounts();
      setAccounts(Array.isArray(response?.data) ? response.data : []);
      const customerRes = await getAllCustomers().catch(() => ({ data: [] }));
      setCustomers(Array.isArray(customerRes?.data) ? customerRes.data : []);
      if (!silent) {
        setMessage("");
      }
    } catch (error) {
      setMessage(getErrorMessage(error, "Could not load customer accounts."));
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadAccounts();
    const intervalId = window.setInterval(() => {
      loadAccounts({ silent: true });
    }, 10000);
    return () => window.clearInterval(intervalId);
  }, []);

  const customerMap = useMemo(() => {
    const map = new Map();
    customers.forEach((item) => {
      map.set(String(item.id ?? item.userId ?? ""), item);
    });
    return map;
  }, [customers]);

  const updateLocalCustomerStatus = (userId, status) => {
    const next = customers.map((customer) =>
      String(customer.id ?? customer.userId ?? "") === String(userId)
        ? { ...customer, status, active: status === "ACTIVE" }
        : customer,
    );
    setCustomers(next);
  };

  const changeStatus = async (account, targetStatus) => {
    const key = `${targetStatus}:${account.accountId}`;
    if (actionKey === key) return;

    try {
      setActionKey(key);
      if (targetStatus === "ACTIVE" && normalizeAccountStatus(account.status) === "PENDING_KYC") {
        await approveAccountKyc(account.accountId);
        setMessage("KYC approved. Account is now active.");
      } else if (targetStatus === "DEACTIVATED") {
        await deactivateAccount(account.accountId);
        setMessage("Account has been deactivated by bank authority.");
      } else if (targetStatus === "ACTIVE") {
        await activateAccount(account.accountId);
        setMessage("Account has been reactivated.");
      }

      updateLocalCustomerStatus(account.userId, targetStatus);
      await loadAccounts({ silent: true });
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to update account status."));
    } finally {
      setActionKey("");
    }
  };

  return (
    <AppShell
      title="Customer account management portal."
      subtitle="Activate accounts, review customer activity, and maintain system security."
      actions={
        <button className="btn btn-outline-primary" onClick={() => loadAccounts()} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh Accounts"}
        </button>
      }
    >
      {message ? <div className="alert alert-info mt-4 mb-0">{message}</div> : null}
      <section className="surface-card mt-4">
        <div className="section-heading"><div><span className="eyebrow">Customers</span><h2>Registered users</h2></div></div>
        <div className="table-responsive">
          <table className="table modern-table align-middle mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>User Code</th>
                <th>Account Number</th>
                <th>Balance</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length > 0 ? (
                accounts.map((account) => {
                  const status = normalizeAccountStatus(account.status);
                  const customer = customerMap.get(String(account.userId)) || {};
                  const rowActionKey = `${status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE"}:${account.accountId}`;
                  return (
                    <tr key={account.accountId}>
                      <td>{customer.name || `Customer #${account.userId}`}</td>
                      <td>{customer.email || "Not available"}</td>
                      <td>{customer.userCode || "UR Pending"}</td>
                      <td className="metric-code">{account.accountNumber || "Not assigned"}</td>
                      <td>{formatCurrency(account.balance || 0)}</td>
                      <td><span className="status-badge">{status.replace("_", " ")}</span></td>
                      <td className="text-end d-flex justify-content-end flex-wrap gap-2">
                        {status === "PENDING_KYC" ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => changeStatus(account, "ACTIVE")}
                            disabled={actionKey === `ACTIVE:${account.accountId}`}
                          >
                            {actionKey === `ACTIVE:${account.accountId}` ? "Approving..." : "Approve KYC"}
                          </button>
                        ) : null}
                        {status !== "DEACTIVATED" ? (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => changeStatus(account, "DEACTIVATED")}
                            disabled={actionKey === `DEACTIVATED:${account.accountId}`}
                          >
                            {actionKey === `DEACTIVATED:${account.accountId}` ? "Updating..." : "Deactivate"}
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => changeStatus(account, "ACTIVE")}
                            disabled={actionKey === rowActionKey}
                          >
                            {actionKey === rowActionKey ? "Updating..." : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="6" className="text-center text-muted py-4">No customer accounts found yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

export default CustomerManagement;
