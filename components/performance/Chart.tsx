"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const Chart = ({ data }: { data: { name: string; total: number }[] }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">{`Month: ${label}`}</p>
          <p className="text-blue-600 font-bold">
            {`Revenue: PKR ${payload[0].value.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={12}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `PKR ${value}`}
              tick={{ fill: '#64748b' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="total" 
              fill="url(#blueGradient)" 
              radius={[6, 6, 0, 0]}
              className="hover:opacity-80 transition-opacity duration-200"
            />
            <defs>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border-2 border-dashed border-blue-200">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mb-4">
              <BarChart className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Data Available</h3>
            <p className="text-slate-600 max-w-sm">
              Start selling courses to see your performance analytics and revenue trends.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chart;
