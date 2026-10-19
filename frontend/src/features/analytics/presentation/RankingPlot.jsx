import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { metricLabels } from '../domain/analytics.js';

export default function RankingPlot({ document }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={document.data} layout="vertical" margin={{ left: 10, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" />
        <YAxis
          type="category"
          dataKey="display_name"
          width={110}
          tick={{ fontSize: 12 }}
        />
        <Tooltip />
        <Bar
          dataKey={document.metric}
          name={metricLabels[document.metric]}
          fill="#C8102E"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
