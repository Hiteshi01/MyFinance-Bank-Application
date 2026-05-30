import { Link } from "react-router-dom";
import AboutSection from "../components/AboutSection";
import AppShell from "../components/AppShell";
import Footer from "../components/Footer";
import { getSession } from "../utils/api";

function About() {
  const session = getSession();

  if (session) {
    return (
      <AppShell
        title="About"
        subtitle="Digital banking designed for modern life."
      >
        <AboutSection />
      </AppShell>
    );
  }

  return (
    <div className="auth-shell about-public-shell">
      <div className="container auth-shell-container">
        <div className="row g-4 align-items-center auth-shell-row">
          <div className="col-12">
            <div className="surface-card about-public-card">
              <AboutSection />
              <div className="about-cta-row mt-4">
                <Link to="/customer-login" className="btn btn-primary btn-lg">Customer Login</Link>
                <Link to="/admin-login" className="btn btn-outline-primary btn-lg">Admin Login</Link>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
