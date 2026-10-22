import { useId } from 'react';

export function StadiumArt() {
  const id = useId().replaceAll(':', '');
  return (
    <svg
      className="stadium-art"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop stopColor="#C3271D" stopOpacity="0.48" />
          <stop offset="1" stopColor="#C3271D" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-pitch`} x2="0" y2="1">
          <stop className="pitch-light" />
          <stop offset="1" className="pitch-dark" />
        </linearGradient>
        <linearGradient id={`${id}-beam`} x2="0.5" y2="1">
          <stop stopColor="#FFFFFF" stopOpacity="0.23" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <pattern
          id={`${id}-seats`}
          width="22"
          height="14"
          patternUnits="userSpaceOnUse"
        >
          <rect width="8" height="3" rx="1" className="stadium-seat" />
          <rect x="11" y="7" width="8" height="3" rx="1" className="stadium-seat" />
        </pattern>
      </defs>
      <ellipse cx="800" cy="450" rx="790" ry="380" fill={`url(#${id}-glow)`} />
      <path
        d="M-70 260Q800 15 1670 260L1620 530Q800 270-20 530Z"
        className="stadium-stand"
      />
      <path
        d="M-70 260Q800 15 1670 260L1620 530Q800 270-20 530Z"
        fill={`url(#${id}-seats)`}
        opacity="0.65"
      />
      {[0, 1, 2, 3, 4].map((row) => (
        <path
          key={row}
          d={`M-50 ${280 + row * 46}Q800 ${30 + row * 49} 1650 ${280 + row * 46}`}
          fill="none"
          className="stand-ring"
        />
      ))}
      <path
        d="M-80 255Q800-15 1680 255"
        className="stadium-roof"
        fill="none"
        strokeWidth="16"
      />
      <path
        d="M-80 266Q800-4 1680 266"
        stroke="#C3271D"
        fill="none"
        strokeWidth="2"
        opacity="0.7"
      />
      {[150, 430, 710, 990, 1270, 1550].map((x, i) => (
        <g key={x} opacity="0.8">
          <path
            d={`M${x} ${165 - Math.sin(i) * 65}L${x - 180} 710H${x + 210}Z`}
            fill={`url(#${id}-beam)`}
          />
          <rect
            x={x - 18}
            y={165 - Math.sin(i) * 65}
            width="36"
            height="4"
            rx="2"
            className="stadium-lamp"
          />
        </g>
      ))}
      <path d="M240 440H1360L1840 920H-240Z" fill={`url(#${id}-pitch)`} />
      {[0, 1, 2, 3, 4, 5].map((stripe) => (
        <path
          key={stripe}
          d={`M${240 + stripe * 186} 440L${-240 + stripe * 346} 920H${-66 + stripe * 346}L${333 + stripe * 186} 440Z`}
          className="pitch-stripe"
        />
      ))}
      <g fill="none" className="pitch-markings" strokeWidth="2">
        <path d="M310 470H1290L1630 860H-30ZM800 470V860M310 575H520L455 700H175m1115-125h-210l65 125h280" />
        <ellipse cx="800" cy="628" rx="125" ry="40" />
        <circle cx="800" cy="628" r="3" />
      </g>
      <path d="M-10 540H1610" stroke="#C3271D" strokeWidth="4" opacity="0.25" />
    </svg>
  );
}
