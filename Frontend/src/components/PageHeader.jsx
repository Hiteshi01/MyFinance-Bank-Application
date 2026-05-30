function PageHeader({ badge, title, description, action }) {
  return (
    <div className="page-header surface-card">
      <div>
        <span className="eyebrow">{badge}</span>
        <h1>{title}</h1>
        <p className="mb-0">{description}</p>
      </div>
      {action ? <div className="page-header-action">{action}</div> : null}
    </div>
  );
}

export default PageHeader;
