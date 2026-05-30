import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../../components/AuthShell";
import { registerCustomer } from "../../services/authService";
import { appendCustomerRecord, getErrorMessage } from "../../utils/api";

const emailPattern = /\S+@\S+\.\S+/;

function CustomerRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!form.name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    if (!emailPattern.test(form.email.trim())) {
      setError("Invalid email format.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await registerCustomer({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
      });

      const userId = response?.data?.id || response?.data?.userId;
      const successMessage =
        "Customer registered successfully. Your account is created with an opening balance of Rs. 2000 and is pending KYC verification. Please login.";

      appendCustomerRecord({
        id: userId || Date.now(),
        name: form.name.trim(),
        email: form.email.trim(),
        active: false,
        status: "PENDING_KYC",
        balance: 2000,
      });
      setSuccess(successMessage);
      setTimeout(() => navigate("/customer-login"), 900);
    } catch (err) {
      setError(getErrorMessage(err, "Customer registration failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Customer Onboarding"
      title="Create your MyFin Bank account and begin your secure banking journey."
      subtitle="Fast registration, instant account access, and complete financial control."
      formTitle="Customer Registration"
      switchLinks={[
        { prefix: "Already have an account?", label: "Login here", to: "/customer-login" },
        { label: "Register as Admin", to: "/admin-register" },
      ]}
    >
      <form onSubmit={handleSubmit} className="auth-form-grid">
        <input className="form-control form-control-lg" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="form-control form-control-lg" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="form-control form-control-lg" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error ? <div className="alert alert-danger mb-0">{error}</div> : null}
        {success ? <div className="alert alert-success mb-0">{success}</div> : null}
        <button className="btn btn-primary btn-lg w-100" disabled={loading}>{loading ? "Creating profile..." : "Register Customer"}</button>
      </form>
    </AuthShell>
  );
}

export default CustomerRegister;
