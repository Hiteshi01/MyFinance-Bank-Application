import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import { getMessages, sendMessage } from "../../services/chatService";
import { getErrorMessage, getSession } from "../../utils/api";
import { createReference, formatDateTime } from "../../utils/banking";

function Chat({ currentUserId, selectedUserId }) {
  const session = getSession();

  const customerId = currentUserId ?? session?.id ?? session?.userId;
  const adminId = selectedUserId ?? 1;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);

      if (!customerId) {
        setStatus("Login required before loading messages.");
        setMessages([]);
        return;
      }

      const customerIdValue = Number(customerId);
      const adminIdValue = Number(adminId);

      if (!Number.isFinite(customerIdValue)) {
        setStatus("Invalid customer ID. Please login again.");
        return;
      }

      if (!Number.isFinite(adminIdValue)) {
        setStatus("Invalid admin ID.");
        return;
      }

      const res = await getMessages({
        senderId: customerIdValue,
        receiverId: adminIdValue,
      });

      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Load Error:", err);
      setStatus("Unable to load messages.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim()) {
      setStatus("Type a message before sending.");
      return;
    }

    try {
      setLoading(true);

      const customerIdValue = Number(customerId);
      const adminIdValue = Number(adminId);

      if (!Number.isFinite(customerIdValue)) {
        setStatus("Invalid customer ID.");
        return;
      }

      if (!Number.isFinite(adminIdValue)) {
        setStatus("Invalid admin ID.");
        return;
      }

      const payload = {
        senderId: customerIdValue,
        receiverId: adminIdValue,
        content: text,
      };

      console.log("Sending payload:", payload);

      await sendMessage(payload);

      // Optimistic UI update
      setMessages((prev) => [
        ...prev,
        {
          id: createReference("MSG"),
          senderId: customerIdValue,
          receiverId: adminIdValue,
          content: text,
          timestamp: new Date().toISOString(),
        },
      ]);

      setText("");
      setStatus("Message sent.");
    } catch (err) {
      console.error("Send Error:", err);
      setStatus(getErrorMessage(err, "Message could not be sent."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="Support Chat"
      subtitle="Customers can communicate with bank support."
    >
      {status && <div className="alert alert-info mt-4">{status}</div>}

      <section className="surface-card mt-4">
        <div className="chat-window">
          {messages.length > 0 ? (
            messages.map((item) => {
              const senderId = Number(item?.senderId);
              const userId = Number(customerId);
              const adminIdValue = Number(adminId);
              const isCustomer = senderId === userId;
              console.log("chat-user-label", senderId, userId, adminIdValue);

              return (
                <div
                  key={item.id || item.messageId}
                  className={
                    isCustomer ? "chat-bubble chat-bubble-user" : "chat-bubble"
                  }
                >
                  <span>{isCustomer ? "You" : "Admin sent it"}</span>

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
            placeholder="Write your message"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </div>
      </section>
    </AppShell>
  );
}

export default Chat;
