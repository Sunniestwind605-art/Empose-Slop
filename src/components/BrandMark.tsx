import { BRAND } from '../config';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-mark" aria-label={BRAND.name}>
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <rect width="36" height="36" rx="11" fill="#20211f" />
        <circle cx="18" cy="10.5" r="4.5" fill="#ff654f" />
        <path d="M18 16c-5.8 0-10 4.4-10 10v4h6v-6h8v6h6v-4c0-5.6-4.2-10-10-10Z" fill="#f7f2e8" />
        <circle cx="29" cy="8" r="2.4" fill="#c9ff64" />
      </svg>
      {!compact && <span>{BRAND.name}</span>}
    </span>
  );
}

