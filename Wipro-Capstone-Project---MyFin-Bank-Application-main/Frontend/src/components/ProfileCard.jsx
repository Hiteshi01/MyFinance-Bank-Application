import { useNavigate } from "react-router-dom";
import { clearSession } from "../utils/api";
import { formatCurrency, replaceBankingState } from "../utils/banking";

function ProfileCard({
  userId,
  userCode,
  adminCode,
  accountNumber,
  name,
  email,
  status = "Active",
  totalBalance = 0,
  role = "customer",
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    replaceBankingState({});
    navigate(role === "admin" ? "/admin-login" : "/customer-login");
  };

  return (
    <article className="surface-card profile-card h-100">
      <div className="profile-card-header">
        <div>
          <span className="eyebrow">Profile Card</span>
          <h2>{name || "MYFin-Bank User"}</h2>
        </div>
        <span
          className={
            status === "Active" ? "status-badge" : "status-badge status-badge-muted"
          }
        >
          {status}
        </span>
      </div>

      <dl className="profile-meta">
        <div>
          <dt>User ID</dt>
          <dd>{userId || "Not assigned"}</dd>
        </div>
        {userCode ? (
          <div>
            <dt>User Code</dt>
            <dd>{userCode}</dd>
          </div>
        ) : null}
        {adminCode ? (
          <div>
            <dt>Admin Code</dt>
            <dd>{adminCode}</dd>
          </div>
        ) : null}
        {accountNumber ? (
          <div>
            <dt>Account Number</dt>
            <dd>{accountNumber}</dd>
          </div>
        ) : null}
        <div>
          <dt>Email</dt>
          <dd>{email || "Not available"}</dd>
        </div>
        <div>
          <dt>Account Status</dt>
          <dd>{status}</dd>
        </div>
        <div>
          <dt>Total Account Balance</dt>
          <dd>{formatCurrency(totalBalance)}</dd>
        </div>
      </dl>

      <button className="btn btn-danger mt-3 align-self-start" onClick={handleLogout}>
        Logout
      </button>
    </article>
  );
}

export default ProfileCard;
