import React from 'react';

// Beaubook brand logo mark — cross with orange ring centre.
// Colours taken directly from the brand artwork:
//   TEAL   bright teal-green for vertical arms + badge bg
//   ORANGE coral for the centre ring
//   Horizontal arms = same teal at reduced opacity (lighter look)
//
// variant="badge"  teal rounded-square bg, white arms   nav / login / footer
// variant="mark"   teal arms on transparent             hero / light surfaces

const TEAL   = '#0EC4A7';
const ORANGE = '#F47B38';

// Each arm: angle rotates the coordinate system so we always draw "upward"
// near  = gap from centre (so arms don't overlap the ring)
// far   = tip distance from centre
// width = stroke thickness (strokeLinecap="round" makes rounded pill ends)
const ARMS = [
  { angle:   0, near: 16, far: 50, width: 20, opacity: 1    }, // top
  { angle: 180, near: 16, far: 50, width: 20, opacity: 1    }, // bottom
  { angle:  90, near: 16, far: 37, width: 14, opacity: 0.38 }, // right  (shorter + faded)
  { angle: -90, near: 16, far: 37, width: 14, opacity: 0.38 }, // left
];

export default function BrandMark({ size = 32, variant = 'mark' }) {
  const isBadge  = variant === 'badge';
  const armColor = isBadge ? '#ffffff' : TEAL;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 112 112"
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      {/* Badge background */}
      {isBadge && (
        <>
          <defs>
            <linearGradient id="bb-badge-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#13CEB1" />
              <stop offset="100%" stopColor="#0EA890" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="112" height="112" rx="26" fill="url(#bb-badge-grad)" />
        </>
      )}

      <g transform="translate(56,56)">
        {/* Cross arms */}
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
        {/* White core — ensures the ring centre always reads white */}
        <circle cx="0" cy="0" r="8" fill={isBadge ? 'rgba(255,255,255,0.3)' : '#ffffff'} />
        {/* Orange ring */}
        <circle cx="0" cy="0" r="11" fill="none" stroke={ORANGE} strokeWidth="9" />
      </g>
    </svg>
  );
}
