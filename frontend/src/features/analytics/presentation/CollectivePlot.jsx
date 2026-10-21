import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { collectiveLabels } from '../domain/collective.js';

export default function CollectivePlot({
  rows,
  metrics = ['points'],
  category = 'official_round',
  bars = false,
}) {
  const Chart = bars ? BarChart : LineChart;
  const Shape = bars ? Bar : Line;
  return (
    <div
      className="collective-chart"
      role="img"
      aria-label={`Gráfico de ${metrics.map((key) => collectiveLabels[key] ?? key).join(', ')}`}
    >
      <ResponsiveContainer width="100%" height={300}>
        <Chart data={rows} margin={{ top: 20, right: 25, left: 0, bottom: 35 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={category}
            tick={{ fontSize: 10 }}
            angle={category === 'name' ? -35 : 0}
            textAnchor={category === 'name' ? 'end' : 'middle'}
            interval={category === 'name' ? 0 : 'preserveStartEnd'}
          />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={(value, name) => [
              Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 }),
              name,
            ]}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 18 }} />
          {metrics.map((metric, index) => (
            <Shape
              key={metric}
              type="monotone"
              dataKey={metric}
              name={collectiveLabels[metric] ?? metric}
              stroke={['#c8102e', '#17191d', '#6b7280'][index % 3]}
              fill={['#c8102e', '#17191d', '#6b7280'][index % 3]}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}
