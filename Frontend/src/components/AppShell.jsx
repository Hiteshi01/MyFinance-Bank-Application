import Footer from "./Footer";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function AppShell({ title, subtitle, actions, children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-body">
        <div className="app-sidebar">
          <Sidebar />
        </div>
        <div className="app-content">
          <section className="page-hero surface-card">
            <div>
              <span className="eyebrow">MYFin-Bank Workspace</span>
              <h1>{title}</h1>
              <p className="mb-0">{subtitle}</p>
            </div>
            {actions ? <div className="page-hero-actions">{actions}</div> : null}
          </section>
          {children}
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default AppShell;
