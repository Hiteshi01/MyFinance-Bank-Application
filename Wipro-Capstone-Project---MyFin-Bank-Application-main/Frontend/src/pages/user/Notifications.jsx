import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import { syncCustomerBankingState } from "../../services/syncService";
import { getErrorMessage, getSession } from "../../utils/api";
import { formatDateTime, getBankingState, subscribeToBankingState } from "../../utils/banking";

function Notifications() {
  const session = getSession();
  const userId = session?.userId || session?.id || "";
  const [notifications, setNotifications] = useState(getBankingState().notifications || []);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const refreshNotifications = async ({ silent = false } = {}) => {
    if (!userId) {
      setNotifications([]);
      setMessage("A valid customer session is required to load notifications.");
      return;
    }

    try {
      if (!silent) {
        setLoading(true);
      }

      const snapshot = await syncCustomerBankingState({ userId });
      setNotifications(snapshot.notifications || []);
      setMessage("");
    } catch (error) {
      setMessage(getErrorMessage(error, "Could not load notifications."));
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    refreshNotifications();
    const unsubscribe = subscribeToBankingState((nextState) => {
      if (isMounted) {
        setNotifications(nextState.notifications || []);
      }
    });
    const intervalId = window.setInterval(() => {
      refreshNotifications({ silent: true });
    }, 8000);

    return () => {
      isMounted = false;
      unsubscribe();
      window.clearInterval(intervalId);
    };
  }, [userId]);

  return (
    <AppShell
      title="Stay informed with real-time banking alerts."
      subtitle="Monitor account updates, transaction alerts, and loan notifications."
    >
      {message ? <div className="alert alert-info mt-4 mb-0">{message}</div> : null}
      <section className="surface-card mt-4">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Notification Center</span>
            <h2>Recent alerts</h2>
          </div>
          <button className="btn btn-outline-primary" onClick={() => refreshNotifications()} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <div className="stack-list">
          {notifications.length > 0 ? (
            notifications.map((item) => (
              <div className="list-row" key={item.id || item.notificationId}>
                <div>
                  <strong>{item.title || item.subject || "Notification"}</strong>
                  <p className="mb-0 text-muted">{item.message || item.description}</p>
                </div>
                <span className="amount-pill">{formatDateTime(item.createdAt || item.timestamp)}</span>
              </div>
            ))
          ) : (
            <div className="list-row">
              <div>
                <strong>No notifications</strong>
                <p className="mb-0 text-muted">Your alert center is currently empty.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

export default Notifications;
