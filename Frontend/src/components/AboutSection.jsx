import brandMark from "../assets/myfin-bank-mark.png";

function AboutSection({ className = "" }) {
  return (
    <div className={`about-page ${className}`.trim()}>
      <section className="surface-card">
        <div className="about-hero">
          <img src={brandMark} alt="MYFin-Bank logo" className="about-logo" />
          <div>
            <span className="eyebrow">MyFin Bank Platform</span>
            <h2 className="mb-2">Secure. Reliable. Trusted.</h2>
            <p className="mb-0">
              Banking is about confidence. Our promise is a calm, transparent,
              and dependable experience where every action is verified and every
              customer is supported.
            </p>
          </div>
        </div>
      </section>

      <section className="grid-cards mt-4">
        <div className="metric-card surface-card">
          <span className="eyebrow">Customer Promise</span>
          <h3 className="metric-code mb-2">Satisfaction First</h3>
          <p className="mb-0">
            "Every interaction should feel effortless, respectful, and focused
            on the customer."
          </p>
        </div>
        <div className="metric-card surface-card">
          <span className="eyebrow">Banking Trust</span>
          <h3 className="metric-code mb-2">Clarity Always</h3>
          <p className="mb-0">
            "Clear balances, clear transactions, and clear communication build
            lifelong banking relationships."
          </p>
        </div>
      </section>

      <section className="surface-card mt-4">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Capabilities</span>
            <h2 className="mb-2">Banking That Respects Your Time</h2>
            <p className="mb-0">
              From onboarding to support, every step is designed to be secure,
              responsive, and easy to understand.
            </p>
          </div>
        </div>
        <div className="feature-grid mt-3">
          <div className="feature-card">
            <strong>Secure Transactions</strong>
            <p className="mb-0">
              Every deposit, withdrawal, and transfer is validated and recorded
              for complete transparency.
            </p>
          </div>
          <div className="feature-card">
            <strong>Verified Accounts</strong>
            <p className="mb-0">
              Verification ensures accounts stay protected and compliant at all
              times.
            </p>
          </div>
          <div className="feature-card">
            <strong>Customer Care</strong>
            <p className="mb-0">
              Dedicated support chat keeps help available when you need it most.
            </p>
          </div>
          <div className="feature-card">
            <strong>Real-Time Updates</strong>
            <p className="mb-0">
              Banking alerts keep you informed without the extra effort.
            </p>
          </div>
        </div>
      </section>

      <section className="surface-card mt-4">
        <span className="eyebrow">Credits</span>
        <h2 className="mb-2">Project Acknowledgement</h2>
        <p className="mb-0">
          This application is developed by <span className="brand-highlight">Aryan Soni</span> in mentorship by
          Great Learning faculty - <span className="mentor-highlight">Sakshi Mohinia</span>.
        </p>
      </section>
    </div>
  );
}

export default AboutSection;
