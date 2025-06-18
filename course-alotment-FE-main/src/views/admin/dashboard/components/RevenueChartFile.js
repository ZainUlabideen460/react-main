import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Sample data
const data = [
  { date: 'Jan 1', Revenue: 1475 },
  { date: 'Jan 8', Revenue: 1936 },
  { date: 'Jan 15', Revenue: 1555 },
  { date: 'Jan 22', Revenue: 1557 },
  { date: 'Jan 29', Revenue: 1977 },
  { date: 'Feb 5', Revenue: 2315 },
  { date: 'Feb 12', Revenue: 1736 },
  { date: 'Feb 19', Revenue: 1981 },
  { date: 'Feb 26', Revenue: 2581 },
  { date: 'Mar 5', Revenue: 2592 },
  { date: 'Mar 12', Revenue: 2635 },
  { date: 'Mar 19', Revenue: 2074 },
  { date: 'Mar 26', Revenue: 2984 },
  { date: 'Apr 2', Revenue: 2254 },
  { date: 'Apr 9', Revenue: 3159 },
  { date: 'Apr 16', Revenue: 2804 },
  { date: 'Apr 23', Revenue: 2602 },
  { date: 'Apr 30', Revenue: 2840 },
  { date: 'May 7', Revenue: 3299 },
  { date: 'May 14', Revenue: 3487 },
  { date: 'May 21', Revenue: 3439 },
  { date: 'May 28', Revenue: 3095 },
  { date: 'Jun 4', Revenue: 3252 },
  { date: 'Jun 11', Revenue: 4096 },
  { date: 'Jun 18', Revenue: 4193 },
  { date: 'Jun 25', Revenue: 4759 },
];

// Formatter to display currency
const valueFormatter = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

const RevenueChartFile = () => {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>Revenue Over Time</h2>
        <p style={styles.subtitle}>Weekly trends in gross revenue</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis dataKey="date" />
          <YAxis
            tickFormatter={valueFormatter}
            width={80}
            domain={[0, 'dataMax + 1000']}
          />
          <Tooltip
            formatter={(value) => valueFormatter(value)}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Line
            type="monotone"
            dataKey="Revenue"
            stroke="#3182ce" // Blue color
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Basic styles
const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '1.5rem',
    margin: '0 0 5px 0',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#666',
    margin: 0,
  },
};

export default RevenueChartFile;
