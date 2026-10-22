import { useId } from 'react';
import { formatCollectiveValue as format } from '../../analytics/presentation/format-value.js';

export function EvolutionIllustration({ rows = [] }) {
  const id = useId().replaceAll(':', '');
  const data = rows.filter(
    (row) => Number.isFinite(row.points) && Number.isFinite(row.official_round),
  );
  const first = data[0];
  const last = data.at(-1);
  const maximum = Math.max(1, ...data.map((row) => row.points));
  const points = data.map((row) => ({
    x:
      40 +
      (274 * (row.official_round - first.official_round)) /
        Math.max(1, last.official_round - first.official_round),
    y: 165 - (82 * row.points) / maximum,
  }));
  const line = points
    .map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`)
    .join(' ');
  const milestones = [
    ...new Set([
      0,
      Math.floor(points.length / 3),
      Math.floor((2 * points.length) / 3),
      points.length - 1,
    ]),
  ].filter((index) => index >= 0 && points[index]);
  return (
    <svg
      className="feature-illustration"
      viewBox="0 0 360 210"
      role="img"
      aria-labelledby={`${id}-title`}
      data-visualization="evolution-illustration"
      data-preview-points={last?.points}
    >
      <title id={`${id}-title`}>
        {last
          ? `Evolução real do Flamengo, rodada ${first.official_round} a ${last.official_round}: ${last.points} pontos acumulados`
          : 'Ilustração de evolução; dados indisponíveis'}
      </title>
      <defs>
        <linearGradient id={`${id}-surface`} x2="1" y2="1">
          <stop stopColor="var(--surface)" />
          <stop offset="1" stopColor="var(--surface-soft)" />
        </linearGradient>
        <linearGradient id={`${id}-area`} x2="0" y2="1">
          <stop stopColor="#C3271D" stopOpacity=".25" />
          <stop offset="1" stopColor="#C3271D" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect
        x="25"
        y="27"
        width="318"
        height="168"
        rx="13"
        className="illustration-shadow"
      />
      <rect
        x="16"
        y="17"
        width="328"
        height="176"
        rx="13"
        fill={`url(#${id}-surface)`}
        className="illustration-frame"
      />
      <circle cx="38" cy="40" r="4" fill="#C3271D" />
      <text x="50" y="44" className="illustration-label">
        Pontos acumulados
      </text>
      {last && (
        <text x="315" y="46" textAnchor="end" className="illustration-value">
          {format(last.points)}
        </text>
      )}
      {[83, 124, 165].map((y) => (
        <path key={y} d={`M40 ${y}H316`} className="illustration-grid" />
      ))}
      <path d="M40 71v94h276" className="illustration-axis" />
      {points.length > 0 ? (
        <>
          <path
            d={`${line} L${points.at(-1).x},165 L40,165Z`}
            fill={`url(#${id}-area)`}
          />
          <path d={line} className="illustration-series" />
          {milestones.map((index) => (
            <g key={index}>
              <circle
                cx={points[index].x}
                cy={points[index].y}
                r="7"
                className="illustration-point-halo"
              />
              <circle
                cx={points[index].x}
                cy={points[index].y}
                r="3.5"
                className="illustration-point"
              />
            </g>
          ))}
          <text x="40" y="182" className="illustration-caption">
            R{first.official_round}
          </text>
          <text x="315" y="182" textAnchor="end" className="illustration-caption">
            R{last.official_round}
          </text>
        </>
      ) : (
        <text x="180" y="127" textAnchor="middle" className="illustration-label">
          Prévia indisponível
        </text>
      )}
    </svg>
  );
}

export function VenueIllustration({ rows = [] }) {
  const id = useId().replaceAll(':', '');
  const home = rows.find((row) => row.venue === 'home');
  const away = rows.find((row) => row.venue === 'away');
  const available = Number.isFinite(home?.points) && Number.isFinite(away?.points);
  const maximum = available ? Math.max(1, home.points, away.points) : 1;
  return (
    <svg
      className="feature-illustration"
      viewBox="0 0 360 210"
      role="img"
      aria-labelledby={`${id}-title`}
      data-visualization="venue-illustration"
    >
      <title id={`${id}-title`}>
        {available
          ? `Dentro e fora de casa: mandante ${home.points} pontos, visitante ${away.points} pontos`
          : 'Ilustração de campo e mando; dados indisponíveis'}
      </title>
      <defs>
        <linearGradient id={`${id}-pitch`} x2="0" y2="1">
          <stop stopColor="#C3271D" stopOpacity=".16" />
          <stop offset=".5" stopColor="#C3271D" stopOpacity=".04" />
          <stop offset="1" stopColor="var(--surface-soft)" />
        </linearGradient>
      </defs>
      <rect
        x="19"
        y="13"
        width="150"
        height="185"
        rx="30"
        className="illustration-stadium"
      />
      <rect
        x="26"
        y="20"
        width="136"
        height="171"
        rx="25"
        className="illustration-seats"
      />
      <rect
        x="35"
        y="30"
        width="118"
        height="151"
        rx="5"
        fill={`url(#${id}-pitch)`}
        className="illustration-frame"
      />
      <g className="illustration-pitch-lines">
        <path d="M42 38h104v135H42ZM42 105.5h104M64 38v27h60V38M64 173v-27h60v27M77 38v12h34V38M77 173v-12h34v12" />
        <circle cx="94" cy="105.5" r="18" />
        <circle cx="94" cy="105.5" r="2" />
        <path d="M87 30v-7h14v7m-14 151v7h14v-7" />
      </g>
      <path d="M161 69h18m-18 77h18" className="illustration-connector" />
      {[
        ['home', 'MANDANTE', home, 32],
        ['away', 'VISITANTE', away, 114],
      ].map(([venue, label, row, y]) => (
        <g key={venue} transform={`translate(181,${y})`}>
          <rect width="161" height="64" rx="11" className="illustration-tile" />
          <circle
            cx="15"
            cy="17"
            r="3"
            fill={venue === 'home' ? '#C3271D' : 'var(--chart-secondary)'}
          />
          <text x="25" y="21" className="illustration-caption">
            {label}
          </text>
          <text x="16" y="43" className="illustration-score">
            {available ? format(row.points) : '—'}
          </text>
          <text x="52" y="41" className="illustration-caption">
            {available ? 'pontos' : 'indisponível'}
          </text>
          <rect
            x="16"
            y="51"
            width="129"
            height="3"
            rx="1.5"
            className="illustration-track"
          />
          {available && (
            <rect
              x="16"
              y="51"
              width={(129 * row.points) / maximum}
              height="3"
              rx="1.5"
              fill={venue === 'home' ? '#C3271D' : 'var(--chart-secondary)'}
              data-venue={venue}
              data-points={row.points}
            />
          )}
        </g>
      ))}
    </svg>
  );
}
