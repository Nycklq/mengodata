import { useId } from 'react';

export function DataFlow() {
  const id = useId().replaceAll(':', '');
  const stages = [
    ['OpenFootball', 'Fonte CC0'],
    ['Python + Pandas', 'Bronze · Silver · Gold'],
    ['Parquet', 'Dados validados'],
    ['PostgreSQL + API', 'Uma base consistente'],
    ['React + Power BI', 'Análise em perspectiva'],
  ];
  return (
    <div
      className="data-flow-scroll"
      role="region"
      aria-label="Fluxo da engenharia de dados"
      tabIndex={0}
    >
      <svg
        viewBox="0 0 1160 160"
        role="img"
        aria-label="OpenFootball, Python e Pandas, Parquet, PostgreSQL e API, React e Power BI"
      >
        <defs>
          <marker
            id={id}
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <path d="m0 1 5 3-5 3" fill="none" stroke="var(--red)" />
          </marker>
        </defs>
        {stages.map(([title, subtitle], index) => (
          <g key={title} transform={`translate(${index * 235},0)`}>
            {index < stages.length - 1 && (
              <path
                d="M200 80h32"
                className="flow-connector"
                markerEnd={`url(#${id})`}
              />
            )}
            <rect x="1" y="20" width="200" height="120" rx="14" className="flow-card" />
            <text x="20" y="49" className="flow-number">
              0{index + 1}
            </text>
            <text x="20" y="85" className="flow-title">
              {title}
            </text>
            <text x="20" y="110" className="flow-subtitle">
              {subtitle}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
