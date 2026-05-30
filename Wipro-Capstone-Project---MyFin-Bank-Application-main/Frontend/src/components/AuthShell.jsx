import { Link } from "react-router-dom";
import brandMark from "../assets/myfin-bank-mark.png";

function AuthShell({
  badge,
  title,
  subtitle,
  formTitle,
  switchLinks = [],
  children,
}) {
  return (
    <div className="auth-shell">
      <div className="container auth-shell-container">
        <div className="row g-4 align-items-center auth-shell-row">
          <div className="col-lg-6 order-2 order-lg-1">
            <div className="auth-copy-panel">
              <span className="eyebrow">{badge}</span>
              <h1>{title}</h1>
              <p>{subtitle}</p>
              <div className="auth-stat-grid mt-4">
                <div className="surface-card">
                  <strong>Trusted Banking Access</strong>
                  <p className="mb-0">Customer and admin login flows connect directly to Spring Boot services through the banking gateway.</p>
                </div>
                <div className="surface-card">
                  <strong>Professional UX</strong>
                  <p className="mb-0">A premium MYFin-Bank identity now carries from authentication into customer and admin workspaces.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-5 ms-lg-auto order-1 order-lg-2">
            <div className="surface-card auth-form-card">
              <div className="auth-brand-block">
                <img src={brandMark} alt="MYFin-Bank logo" className="auth-logo" />
                <div className="auth-brand-copy">
                  <p className="auth-brand-name mb-0">MYFIN-BANK</p>
                  <p className="auth-brand-tagline mb-0">
                    Secure digital banking for a smarter financial future.
                  </p>
                </div>
              </div>
              <p className="form-badge mb-2 mt-4">{badge}</p>
              <h2>{formTitle}</h2>
              {children}
              {switchLinks.length > 0 ? (
                <div className="auth-switch-row mt-3 text-muted">
                  {switchLinks.map((item, index) => (
                    <span key={`${item.label}-${item.to}`} className="auth-switch-item">
                      {item.prefix ? <span>{item.prefix} </span> : null}
                      <Link to={item.to}>{item.label}</Link>
                      {index < switchLinks.length - 1 ? <span className="auth-switch-divider">|</span> : null}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthShell;
