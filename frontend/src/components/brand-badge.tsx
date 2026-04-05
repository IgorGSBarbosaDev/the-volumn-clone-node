export function BrandBadge() {
  return (
    <div className="brand-badge" aria-label="The Volumn brand">
      <span className="brand-badge__mark" aria-hidden="true">
        <svg viewBox="0 0 36 36" role="presentation">
          <defs>
            <linearGradient id="brand-badge-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="18" r="18" fill="url(#brand-badge-gradient)" />
          <path
            d="M8 18.5h5l2.3-6 4.4 13 2.7-7h5.6"
            fill="none"
            stroke="#FFFFFF"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      </span>
      <span className="brand-badge__label">The Volumn</span>
    </div>
  )
}

