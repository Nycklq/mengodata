const shapes = {
  ball: (
    <>
      <circle cx="24" cy="24" r="18" />
      <path d="m24 14 9 7-3 11H18l-3-11Zm0 0V6m9 15 8-3M30 32l5 7M18 32l-5 7M15 21l-8-3" />
    </>
  ),
  shirt: <path d="m17 7-12 8 5 10 6-3v20h16V22l6 3 5-10-12-8c-2 8-12 8-14 0Z" />,
  pitch: (
    <>
      <rect x="5" y="8" width="38" height="32" rx="2" />
      <path d="M24 8v32M5 17h8v14H5m38-14h-8v14h8" />
      <circle cx="24" cy="24" r="6" />
    </>
  ),
  boot: (
    <>
      <path d="m12 7 12 6-3 11 17 7q6 2 4 9H6V27l6-7Z" />
      <path d="m22 24 5-4m-1 6 5-4M12 40v4m12-4v4m12-4v4M7 33h28" />
    </>
  ),
  trophy: (
    <>
      <path d="M15 6h18v15q0 11-9 11T15 21ZM15 11H6v7q0 11 11 11m16-18h9v7q0 11-11 11M24 32v9m-10 2h20" />
    </>
  ),
  target: (
    <>
      <circle cx="24" cy="24" r="18" />
      <circle cx="24" cy="24" r="10" />
      <path d="m24 24 18-18m-9 0h9v9" />
    </>
  ),
  shield: (
    <>
      <path d="m24 5 17 7v12q0 12-17 20Q7 36 7 24V12Z" />
      <path d="m16 24 6 6 12-14" />
    </>
  ),
  whistle: (
    <>
      <path d="M7 18h15l7-7 13 7-9 14H22a10 10 0 1 1-15-14Z" />
      <circle cx="12" cy="26" r="4" />
      <path d="m31 7 2-4m5 8 5-2M24 5V2" />
    </>
  ),
  chart: (
    <>
      <path d="M7 6v35h36M15 34V24m10 10V16m10 18V9" />
      <path d="m12 18 12-9 10-4" />
    </>
  ),
};
export function SportsIcon({ kind = 'ball', size = 48 }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shapes[kind] ?? shapes.ball}
    </svg>
  );
}
