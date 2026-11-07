export default function AuthFieldHint({ id, title, children, className = "" }) {
  return (
    <div id={id} className={`auth-field-hint ${className}`.trim()} role="status">
      <svg className="auth-field-agent" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M24 7v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="5" r="2" fill="currentColor" />
        <rect x="7" y="13" width="34" height="27" rx="10" fill="var(--cc-surface-2)" stroke="currentColor" strokeWidth="2" />
        <path d="M3 23v7M45 23v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="25" r="2.5" fill="currentColor" />
        <circle cx="30" cy="25" r="2.5" fill="currentColor" />
        <path d="M18 33c1.6-2 3.6-3 6-3s4.4 1 6 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="auth-field-speech">
        <strong>{title}</strong>
        <span>{children}</span>
      </span>
    </div>
  );
}
