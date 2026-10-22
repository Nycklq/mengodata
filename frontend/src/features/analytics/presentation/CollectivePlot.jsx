import { useId } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { collectiveLabels } from '../domain/collective.js';

const colors = ['#C3271D', 'var(--chart-secondary)', 'var(--chart-tertiary)'];
const numericDomain = [
  (minimum) => Math.min(0, minimum),
  (maximum) => Math.max(0, maximum),
];
const number = (value) =>
  Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 });

export default function CollectivePlot({
  rows,
  metrics = ['points'],
  category = 'official_round',
  bars = false,
  horizontal = false,
  labels = {},
  height = 320,
  interactive = true,
}) {
  const id = useId().replaceAll(':', '');
  const Chart = bars ? BarChart : AreaChart;
  const reversed = metrics.length === 1 && metrics[0] === 'position';
  const label = (key) => labels[key] ?? collectiveLabels[key] ?? key;
  return (
    <div
      className="collective-chart"
      role="img"
      aria-label={`Gráfico de ${metrics.map(label).join(', ')}${rows.length <= 4 ? '. ' + rows.map((row) => `${row[category]}: ${metrics.map((metric) => `${label(metric)} ${row[metric] === null || row[metric] === undefined ? 'indisponível' : number(row[metric])}`).join(', ')}`).join('; ') : ''}`}
    >
      <ResponsiveContainer
        width="100%"
        height={horizontal ? Math.max(340, rows.length * 34 + 55) : height}
      >
        <Chart
          data={rows}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 16, right: 24, left: horizontal ? 12 : 0, bottom: 12 }}
          barGap={6}
          accessibilityLayer={interactive}
        >
          <defs>
            {metrics.map((metric, index) => (
              <linearGradient
                key={metric}
                id={`${id}-${metric}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={colors[index % 3]} stopOpacity={0.16} />
                <stop offset="100%" stopColor={colors[index % 3]} stopOpacity={0.01} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            stroke="var(--chart-grid)"
            strokeDasharray="4 5"
            vertical={horizontal}
            horizontal={!horizontal}
          />
          <XAxis
            type={horizontal ? 'number' : 'category'}
            dataKey={horizontal ? undefined : category}
            tick={{
              fontSize: 10,
              fill: 'var(--muted)',
              fontFamily: 'Poppins, sans-serif',
            }}
            tickLine={false}
            axisLine={false}
            minTickGap={20}
            tickMargin={12}
            allowDecimals={false}
            domain={horizontal ? numericDomain : undefined}
          />
          <YAxis
            type={horizontal ? 'category' : 'number'}
            dataKey={horizontal ? category : undefined}
            width={horizontal ? 112 : 44}
            tick={{
              fontSize: 10,
              fill: 'var(--muted)',
              fontFamily: 'Poppins, sans-serif',
            }}
            tickLine={false}
            axisLine={false}
            reversed={reversed}
            domain={horizontal ? undefined : reversed ? [1, 20] : numericDomain}
            allowDecimals={false}
            tickMargin={8}
            interval={horizontal ? 0 : 'preserveStartEnd'}
          />
          {interactive && (
            <Tooltip
              cursor={
                bars
                  ? { fill: 'var(--surface-soft)' }
                  : { stroke: 'var(--muted)', strokeDasharray: '4 4' }
              }
              contentStyle={{
                borderRadius: 12,
                border: '1px solid var(--line)',
                background: 'var(--surface-raised)',
                color: 'var(--ink)',
                boxShadow: 'var(--shadow)',
                fontFamily: 'Poppins, sans-serif',
                fontSize: 12,
                padding: '12px 16px',
              }}
              formatter={(value, name) => [number(value), name]}
              labelFormatter={(value) =>
                category === 'official_round' ? `Rodada ${value}` : value
              }
            />
          )}
          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{
              fontSize: 10,
              paddingTop: 16,
              fontFamily: 'Poppins, sans-serif',
            }}
          />
          {metrics.includes('goal_difference') && (
            <ReferenceLine
              y={horizontal ? undefined : 0}
              x={horizontal ? 0 : undefined}
              stroke="var(--muted)"
            />
          )}
          {metrics.map((metric, index) =>
            bars ? (
              <Bar
                key={metric}
                dataKey={metric}
                name={label(metric)}
                fill={colors[index % 3]}
                radius={horizontal ? [0, 4, 4, 0] : [5, 5, 0, 0]}
                maxBarSize={horizontal ? 19 : 48}
                isAnimationActive={false}
              >
                {horizontal &&
                  rows.map((row, rowIndex) => (
                    <Cell
                      key={row.club_id ?? rowIndex}
                      fill={
                        row.club_id === 'club:flamengo'
                          ? colors[0]
                          : 'var(--chart-secondary)'
                      }
                    />
                  ))}
                {!horizontal && rows.length <= 4 && (
                  <LabelList
                    dataKey={metric}
                    position="top"
                    formatter={number}
                    style={{
                      fill: 'var(--ink)',
                      fontSize: 11,
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  />
                )}
              </Bar>
            ) : (
              <Area
                key={metric}
                type="monotone"
                dataKey={metric}
                name={label(metric)}
                stroke={colors[index % 3]}
                fill={`url(#${id}-${metric})`}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, stroke: 'var(--surface)', strokeWidth: 2 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            ),
          )}
        </Chart>
      </ResponsiveContainer>
      {horizontal && (
        <p className="chart-note">Flamengo em vermelho · demais clubes em cinza</p>
      )}
    </div>
  );
}
