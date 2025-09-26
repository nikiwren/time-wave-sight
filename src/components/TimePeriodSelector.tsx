import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type TimePeriod = 'daily' | 'weekly' | 'monthly';

interface TimePeriodSelectorProps {
  value: TimePeriod;
  onValueChange: (value: TimePeriod) => void;
}

export const TimePeriodSelector = ({ value, onValueChange }: TimePeriodSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Time Period:</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-32 bg-card border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};