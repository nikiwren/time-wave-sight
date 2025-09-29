import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, parseISO } from 'date-fns';

export interface BackendDataPoint {
  timestamp_id: string;
  date: string;
  price: number;
  sensitivity: string;
  rmpid: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  price: number;
  timestamp_id: string;
}

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-card-foreground">
          Timestamp ID: <span className="font-bold">{label}</span>
        </p>
        <p className="text-sm text-chart-primary">
          Price: <span className="font-semibold">${payload[0].value.toFixed(2)}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Date: <span className="font-medium">{format(parseISO(data.date), 'MMM dd, yyyy')}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const TimeSeriesChart = ({ data, isLoading }: TimeSeriesChartProps) => {
  if (isLoading) {
    return (
      <div className="h-96 w-full flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-32 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-muted rounded"></div>
            <div className="h-3 bg-muted rounded w-5/6"></div>
            <div className="h-3 bg-muted rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-96 w-full flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--chart-primary))" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
          <XAxis 
            dataKey="timestamp_id" 
            tickFormatter={(timestampId, index) => {
              // Find the corresponding data point to get the date
              const dataPoint = data.find(d => d.timestamp_id === timestampId);
              if (!dataPoint) return timestampId;
              
              // Show dates by default, timestamp_ids when there are fewer than 20 data points (zoomed in)
              if (data.length <= 20) {
                return `#${timestampId}`;
              } else {
                return format(parseISO(dataPoint.date), 'MMM dd');
              }
            }}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            interval="preserveStartEnd"
          />
          <YAxis 
            tickFormatter={(value) => `$${value}`}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--chart-primary))"
            strokeWidth={2}
            fill="url(#priceGradient)"
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--chart-primary))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "hsl(var(--chart-primary))" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};