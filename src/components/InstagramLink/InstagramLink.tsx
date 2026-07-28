export function InstagramLink({ className = "" }: { className?: string }) {
  return (
    <a
      className={className}
      aria-label="Instagram"
      data-analytics-destination="instagram"
      data-analytics-event="outbound_click"
      href="https://www.instagram.com/fabien_hnc/"
      rel="noreferrer"
      target="_blank"
    >
      <svg aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none" />
      </svg>
    </a>
  );
}
