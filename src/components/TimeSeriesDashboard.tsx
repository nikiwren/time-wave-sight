import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeSeriesChart, type TimeSeriesDataPoint } from './TimeSeriesChart';
import { TimePeriodSelector, type TimePeriod } from './TimePeriodSelector';
import { DateRangePicker } from './DateRangePicker';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, format, startOfWeek, startOfMonth } from 'date-fns';

// Mock data generator - replace with actual API calls
const generateMockData = (period: TimePeriod, dateRange?: DateRange): TimeSeriesDataPoint[] => {
  const basePrice = 150;
  const data: TimeSeriesDataPoint[] = [];
  
  if (!dateRange?.from || !dateRange?.to) {
    // Fallback to default behavior if no date range selected
    const days = period === 'daily' ? 30 : period === 'weekly' ? 12 : 6;
    for (let i = 0; i < days; i++) {
      const date = new Date();
      if (period === 'daily') {
        date.setDate(date.getDate() - (days - 1 - i));
      } else if (period === 'weekly') {
        date.setDate(date.getDate() - (days - 1 - i) * 7);
      } else {
        date.setMonth(date.getMonth() - (days - 1 - i));
      }
      
      const variation = (Math.random() - 0.5) * 20;
      const price = basePrice + variation + (Math.sin(i * 0.5) * 10);
      
      data.push({
        date: date.toISOString(),
        price: Math.max(price, 100)
      });
    }
    return data;
  }

  // Generate data based on selected date range and period
  let dates: Date[] = [];
  
  if (period === 'daily') {
    dates = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
  } else if (period === 'weekly') {
    dates = eachWeekOfInterval({ start: dateRange.from, end: dateRange.to }, { weekStartsOn: 1 });
  } else {
    dates = eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });
  }

  dates.forEach((date, i) => {
    const variation = (Math.random() - 0.5) * 20;
    const price = basePrice + variation + (Math.sin(i * 0.5) * 10);
    
    data.push({
      date: date.toISOString(),
      price: Math.max(price, 100)
    });
  });

  return data;
};

export const TimeSeriesDashboard = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date()
  });
  const [data, setData] = useState<TimeSeriesDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API call
  useEffect(() => {
    setIsLoading(true);
    // Simulate network delay
    const timer = setTimeout(() => {
      setData(generateMockData(timePeriod, dateRange));
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [timePeriod, dateRange]);

  const currentPrice = data.length > 0 ? data[data.length - 1]?.price : 0;
  const previousPrice = data.length > 1 ? data[data.length - 2]?.price : 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;

  const isPositive = priceChange >= 0;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Time Series Analytics</h1>
          <p className="text-muted-foreground mt-1">Monitor price movements over time</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <DateRangePicker value={dateRange} onValueChange={setDateRange} />
          <TimePeriodSelector value={timePeriod} onValueChange={setTimePeriod} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {isLoading ? '—' : `$${currentPrice.toFixed(2)}`}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Price Change</CardTitle>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-chart-secondary" />
            ) : (
              <TrendingDown className="h-4 w-4 text-chart-accent" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isPositive ? 'text-chart-secondary' : 'text-chart-accent'}`}>
              {isLoading ? '—' : `${isPositive ? '+' : ''}$${priceChange.toFixed(2)}`}
            </div>
            <p className={`text-xs ${isPositive ? 'text-chart-secondary' : 'text-chart-accent'}`}>
              {isLoading ? '' : `${isPositive ? '+' : ''}${priceChangePercent.toFixed(2)}%`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Period</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground capitalize">
              {timePeriod}
            </div>
            <Badge variant="secondary" className="mt-1 text-xs">
              {data.length} data points
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Price Chart</CardTitle>
          <p className="text-sm text-muted-foreground">
            Historical price data for the selected time period
          </p>
        </CardHeader>
        <CardContent>
          <TimeSeriesChart data={data} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
};