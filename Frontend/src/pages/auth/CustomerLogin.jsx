import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../../components/AuthShell";
import { loginCustomer } from "../../services/authService";
import { getErrorMessage, setSession } from "../../utils/api";
import { replaceBankingState } from "../../utils/banking";

const emailPattern = /\S+@\S+\.\S+/;

function CustomerLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!emailPattern.test(form.email.trim())) {
      setError("Invalid email format.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await loginCustomer(form);
      replaceBankingState({});
      const session = {
        ...response.data,
        email: response.data?.email || form.email,
        name: response.data?.name || response.data?.username || "Customer",
        role: "customer",
      };
      setSession(session);
      sessionStorage.setItem("token", response.data?.token || "");
      navigate("/dashboard");
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to reach the banking gateway. Please ensure API Gateway (8080) is running.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Customer Access"
      title="Welcome to MyFin Bank."
      subtitle="Access your accounts, manage transactions, and control your finances from one secure platform."
      formTitle="Customer Login"
      switchLinks={[
        {
          prefix: "New customer?",
          label: "Register here",
          to: "/customer-register",
        },
        { label: "Login as Admin", to: "/admin-login" },
      ]}
    >
      <form onSubmit={handleSubmit} className="auth-form-grid" noValidate>
        <input
          className="form-control form-control-lg"
          type="email"
          placeholder="Customer email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="form-control form-control-lg"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {error ? <div className="alert alert-danger mb-0">{error}</div> : null}
        <button className="btn btn-primary btn-lg w-100" disabled={loading}>
          {loading ? "Signing in..." : "Login as Customer"}
        </button>
      </form>
    </AuthShell>
  );
}

export default CustomerLogin;
