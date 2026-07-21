import React from 'react';

// Matches the app's purple gradient "B" badge used in the login screen and sidebar.
// variant="badge" — purple rounded square with white B (for nav / footer)
// variant="mark"  — just the B in purple (for hero / light backgrounds)
export default function BrandMark({ size = 32, variant = 'mark' }) {
  const isBadge = variant === 'badge';
  const uid = `bb-${variant}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 112 112"
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      {isBadge && (
        <>
          <defs>
            <linearGradient id={uid} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6d28d9" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="112" height="112" rx="26" fill={`url(#${uid})`} />
        </>
      )}
      <text
        x="56"
        y="82"
        textAnchor="middle"
        fill={isBadge ? '#ffffff' : '#7c3aed'}
        fontSize="80"
        fontWeight="800"
        fontFamily="'Inter', Arial, sans-serif"
      >
        B
      </text>
    </svg>
  );
}
