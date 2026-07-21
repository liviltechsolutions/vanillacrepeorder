import React from 'react';

// Matches the Beaubook brand logo:
// - Vertical arms: solid teal, rounded pill
// - Horizontal arms: same teal at reduced opacity (lighter appearance)
// - Centre: orange/coral ring with white core
// variant="badge" — teal rounded-square background, white arms  (nav / footer)
// variant="mark"  — teal arms on transparent               (hero / light bg)

const TEAL   = '#0d9488';   // matches --primary-2 in LandingPage.css
const ORANGE = '#e6784a';   // matches --accent in LandingPage.css

const ARMS = [
  { angle:   0, near: 15, far: 47, width: 18, opacity: 1    }, // top
  { angle: 180, near: 15, far: 47, width: 18, opacity: 1    }, // bottom
  { angle:  90, near: 15, far: 36, width: 15, opacity: 0.42 }, // right
  { angle: -90, near: 15, far: 36, width: 15, opacity: 0.42 }, // left
];

export default function BrandMark({ size = 32, variant = 'mark' }) {
  const isBadge  = variant === 'badge';
  const armColor = isBadge ? '#ffffff' : TEAL;

  const cross = (
    <g transform="translate(56,56)">
      {ARMS.map(({ angle, near, far, width, opacity }, i) => (
        <line
          key={i}
          x1="0" y1={-near}
          x2="0" y2={-far}
          stroke={armColor}
          strokeWidth={width}
          strokeOpacity={opacity}
          strokeLinecap="round"
          transform={`rotate(${angle})`}
        />
      ))}
      {/* white core so the ring reads as a hollow circle on any bg */}
      <circle cx="0" cy="0" r="9"  fill={isBadge ? 'rgba(255,255,255,0.25)' : 'none'} />
      <circle cx="0" cy="0" r="11" fill="none" stroke={ORANGE} strokeWidth="8" />
    </g>
  );

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
            <linearGradient id="bb-badge-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#14967a" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="112" height="112" rx="27" fill="url(#bb-badge-grad)" />
        </>
      )}
      {cross}
    </svg>
  );
}
