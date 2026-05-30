import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../../components/AuthShell";
import { registerAdmin } from "../../services/authService";
import { appendAdminRecord, getErrorMessage } from "../../utils/api";

const emailPattern = /\S+@\S+\.\S+/;

function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    key: "",
  });
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

    if (!form.key.trim()) {
      setError("Wrong key entered");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await registerAdmin({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        key: form.key.trim(),
      });
      appendAdminRecord({
        id: Date.now(),
        name: form.name.trim(),
        email: form.email.trim(),
      });
      setSuccess("Admin registered successfully. Please login.");
      setTimeout(() => navigate("/admin-login"), 900);
    } catch (err) {
      setError(getErrorMessage(err, "Admin registration failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Admin Onboarding"
      title="Create a secure admin profile for platform operations."
      subtitle="Register an administrator to access loan approvals, customer management, support communication, and notifications monitoring."
      formTitle="Admin Registration"
      switchLinks={[
        {
          prefix: "Already have an admin account?",
          label: "Login here",
          to: "/admin-login",
        },
        { label: "Register as Customer", to: "/customer-register" },
      ]}
    >
      <form onSubmit={handleSubmit} className="auth-form-grid">
        <input
          className="form-control form-control-lg"
          placeholder="Admin name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="form-control form-control-lg"
          type="email"
          placeholder="Admin email"
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
        <input
          className="form-control form-control-lg"
          type="text"
          placeholder="Admin Key"
          value={form.key}
          onChange={(e) => setForm({ ...form, key: e.target.value })}
          required
        />
        {error ? <div className="alert alert-danger mb-0">{error}</div> : null}
        {success ? (
          <div className="alert alert-success mb-0">{success}</div>
        ) : null}
        <button className="btn btn-primary btn-lg w-100" disabled={loading}>
          {loading ? "Creating admin..." : "Register Admin"}
        </button>
      </form>
    </AuthShell>
  );
}

export default AdminRegister;
