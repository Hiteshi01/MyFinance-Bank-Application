import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import { getMessages, sendMessage } from "../../services/chatService";
import { getAllCustomers } from "../../services/authService";
import { getErrorMessage, getSession } from "../../utils/api";
import { createReference, formatDateTime } from "../../utils/banking";

function AdminChat({ currentUserId, selectedUserId }) {
  const session = getSession();

  const adminId = currentUserId ?? session?.id ?? session?.adminId;
  const [activeCustomerId, setActiveCustomerId] = useState(
    selectedUserId ?? null,
  );

  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadMessages();
  }, [activeCustomerId]);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (selectedUserId !== undefined && selectedUserId !== null) {
      setActiveCustomerId(selectedUserId);
    }
  }, [selectedUserId]);

  const loadCustomers = async () => {
    try {
      setCustomersLoading(true);
      const res = await getAllCustomers();
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Customer Load Error:", err);
      setStatus("Unable to load customers.");
    } finally {
      setCustomersLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);

      if (!adminId) {
        setStatus("Login required before loading messages.");
        setMessages([]);
        return;
      }

      const adminIdValue = Number(adminId);

      if (!Number.isFinite(adminIdValue)) {
        setStatus("Invalid admin ID. Please login again.");
        return;
      }

      if (activeCustomerId) {
        const customerIdValue = Number(activeCustomerId);

        if (!Number.isFinite(customerIdValue)) {
          setStatus("Invalid customer ID.");
          return;
        }

        const res = await getMessages({
          senderId: adminIdValue,
          receiverId: customerIdValue,
        });

        setMessages(Array.isArray(res.data) ? res.data : []);
      } else {
        setMessages([]);
        setStatus("Select a customer to view chat.");
      }
    } catch (err) {
      console.error("Load Error:", err);
      setStatus("Unable to load chat messages.");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!text.trim()) {
      setStatus("Type a response before sending.");
      return;
    }

    try {
      setLoading(true);

      const adminIdValue = Number(adminId);
      const customerIdValue = Number(activeCustomerId);

      if (!Number.isFinite(adminIdValue)) {
        setStatus("Invalid admin ID.");
        return;
      }

      if (!Number.isFinite(customerIdValue)) {
        setStatus("Select a valid customer.");
        return;
      }

      const payload = {
        senderId: adminIdValue,
        receiverId: customerIdValue,
        content: text,
      };

      console.log("Sending payload:", payload);

      await sendMessage(payload);

      // Optimistic UI update
      setMessages((prev) => [
        ...prev,
        {
          id: createReference("MSG"),
          senderId: adminIdValue,
          receiverId: customerIdValue,
          content: text,
          timestamp: new Date().toISOString(),
        },
      ]);

      setText("");
      setStatus("Reply sent successfully.");
    } catch (err) {
      console.error("Send Error:", err);
      setStatus(getErrorMessage(err, "Reply could not be sent."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="Admin Chat"
      subtitle="Respond to customer queries and monitor communication."
    >
      {status && <div className="alert alert-info mt-4">{status}</div>}

      <section className="surface-card mt-4">
        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <div className="surface-card h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">Customers</h5>
                {customersLoading ? (
                  <span className="text-muted small">Loading...</span>
                ) : null}
              </div>

              {customers.length ? (
                <div className="list-group">
                  {customers.map((customer) => (
                    <button
                      key={customer.id || customer.userId}
                      type="button"
                      className={`list-group-item list-group-item-action ${
                        Number(activeCustomerId) === Number(customer.id)
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        setActiveCustomerId(customer.id);
                        setStatus("");
                      }}
                    >
                      <div className="fw-semibold">
                        {customer.name || "Customer"}
                      </div>
                      <small>
                        {customer.userCode || `ID: ${customer.id}`}
                      </small>
                      {customer.email ? (
                        <div className="small text-muted">
                          {customer.email}
                        </div>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mb-0 text-muted">
                  No customers found yet.
                </p>
              )}
            </div>
          </div>

          <div className="col-12 col-lg-8">
            <div className="chat-window">
              {messages.length > 0 ? (
                messages.map((item) => {
                  const senderId = Number(item?.senderId);
                  const adminIdValue = Number(adminId);
                  const customerIdValue = Number(activeCustomerId);

                  const isAdmin = senderId === adminIdValue;
                  const isCustomer = senderId === customerIdValue;

                  console.log(
                    "chat-admin-label",
                    senderId,
                    adminIdValue,
                    customerIdValue,
                  );

                  return (
                    <div
                      key={item.id || item.messageId}
                      className={
                        isAdmin ? "chat-bubble" : "chat-bubble chat-bubble-user"
                      }
                    >
                      <span>
                        {isAdmin
                          ? "You (Admin)"
                          : isCustomer
                          ? "User sent it"
                          : "User sent it"}
                      </span>

                      <p>{item.content}</p>

                      <small className="text-muted">
                        {formatDateTime(item.timestamp)}
                      </small>
                    </div>
                  );
                })
              ) : (
                <p>No messages yet.</p>
              )}
            </div>

            <div className="form-stack mt-4">
              <textarea
                className="form-control"
                rows="4"
                placeholder="Reply to customer"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              <button
                className="btn btn-primary"
                onClick={handleReply}
                disabled={loading || !activeCustomerId}
              >
                {loading ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default AdminChat;
