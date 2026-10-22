import { useId } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { collectiveLabels } from '../domain/collective.js';

const colors = ['#c8102e', '#34485d', '#7b8491'];
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
}) {
  const id = useId().replaceAll(':', '');
  const Chart = bars ? BarChart : AreaChart;
  const reversed = metrics.length === 1 && metrics[0] === 'position';
  const label = (key) => labels[key] ?? collectiveLabels[key] ?? key;
  return (
    <div
      className="collective-chart"
      role="img"
      aria-label={`Gráfico de ${metrics.map(label).join(', ')}`}
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
            stroke="#edf0f3"
            strokeDasharray="4 5"
            vertical={horizontal}
            horizontal={!horizontal}
          />
          <XAxis
            type={horizontal ? 'number' : 'category'}
            dataKey={horizontal ? undefined : category}
            tick={{ fontSize: 11, fill: '#616b78' }}
            tickLine={false}
            axisLine={false}
            minTickGap={20}
            tickMargin={12}
            allowDecimals={false}
          />
          <YAxis
            type={horizontal ? 'category' : 'number'}
            dataKey={horizontal ? category : undefined}
            width={horizontal ? 112 : 44}
            tick={{ fontSize: 11, fill: '#616b78' }}
            tickLine={false}
            axisLine={false}
            reversed={reversed}
            domain={reversed ? [1, 20] : ['auto', 'auto']}
            allowDecimals={false}
            tickMargin={8}
            interval={horizontal ? 0 : 'preserveStartEnd'}
          />
          <Tooltip
            cursor={
              bars ? { fill: '#f4f5f7' } : { stroke: '#a9b0bc', strokeDasharray: '4 4' }
            }
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e7e9ed',
              boxShadow: '0 8px 28px #17202e12',
              fontSize: 12,
              padding: '12px 16px',
            }}
            formatter={(value, name) => [number(value), name]}
            labelFormatter={(value) =>
              category === 'official_round' ? `Rodada ${value}` : value
            }
          />
          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: 11, paddingTop: 22 }}
          />
          {metrics.includes('goal_difference') && (
            <ReferenceLine
              y={horizontal ? undefined : 0}
              x={horizontal ? 0 : undefined}
              stroke="#d5d9df"
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
                      fill={row.club_id === 'club:flamengo' ? colors[0] : '#536477'}
                    />
                  ))}
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
                activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }}
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
