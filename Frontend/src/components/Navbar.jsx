import { useNavigate } from "react-router-dom";
import brandMark from "../assets/myfin-bank-mark.png";
import { clearSession, getSession } from "../utils/api";
import { replaceBankingState } from "../utils/banking";

function Navbar() {
  const navigate = useNavigate();
  const session = getSession();

  const logout = () => {
    clearSession();
    replaceBankingState({});
    navigate(session?.role === "admin" ? "/admin-login" : "/customer-login");
  };

  return (
    <header className="topbar">
      <div className="brand-lockup">
        <img src={brandMark} alt="MYFin-Bank logo" className="brand-logo" />
        <div className="brand-text">
          <strong className="brand-title">MyFin-Bank</strong>
          <span className="brand-quote">Secure banking for confident decisions.</span>
        </div>
      </div>
      <div className="topbar-actions">
        <div className="session-pill">
          <strong>{session?.name || session?.email || "Bank User"}</strong>
          <small>{session?.role === "admin" ? "Administrator" : "Customer"}</small>
        </div>
        <button className="btn btn-danger btn-sm" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}

export default Navbar;
