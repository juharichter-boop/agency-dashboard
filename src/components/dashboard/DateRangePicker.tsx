'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { subDays } from 'date-fns';

interface DateRangePickerProps {
  onDaysChange: (days: number) => void;
  defaultDays?: number;
}

export function DateRangePicker({
  onDaysChange,
  defaultDays = 7,
}: DateRangePickerProps) {
  const [selected, setSelected] = useState(defaultDays);

  const options = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 14 days', days: 14 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
  ];

  const handleChange = (days: number) => {
    setSelected(days);
    onDaysChange(days);
  };

  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <Button
          key={option.days}
          variant={selected === option.days ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => handleChange(option.days)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
