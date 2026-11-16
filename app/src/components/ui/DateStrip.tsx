import React from 'react';

export interface DateItem {
  date: Date;
  dateString: string; // ISO YYYY-MM-DD
  dayLabel: string;   // 'सोम', 'मंगल' or 'Mon', 'Tue'
  dayNumber: number;
  isToday: boolean;
  hasItems: boolean;
  hasDanger?: boolean;
}

export interface DateStripProps {
  dates: DateItem[];
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateString: string) => void;
}

export const DateStrip: React.FC<DateStripProps> = ({
  dates,
  selectedDate,
  onSelectDate,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 no-scrollbar select-none">
      {dates.map((item) => {
        const isSelected = item.dateString === selectedDate;
        return (
          <button
            key={item.dateString}
            type="button"
            onClick={() => onSelectDate(item.dateString)}
            className={`flex flex-col items-center justify-center shrink-0 w-12 h-16 rounded-card transition-all duration-150 relative ${
              isSelected
                ? 'bg-teal-900 text-white shadow-soft font-bold'
                : item.isToday
                ? 'bg-teal-100 text-teal-900 border border-teal-700/30'
                : 'bg-surface text-ink border border-line hover:border-teal-700/30'
            }`}
          >
            <span
              className={`text-[11px] font-medium uppercase tracking-tight ${
                isSelected ? 'text-teal-100' : 'text-muted'
              }`}
            >
              {item.dayLabel}
            </span>
            <span className="text-lg leading-tight mt-0.5">{item.dayNumber}</span>

            {/* Dot indicator */}
            {item.hasDanger ? (
              <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-danger" />
            ) : item.hasItems ? (
              <span
                className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                  isSelected ? 'bg-saffron-500' : 'bg-teal-700'
                }`}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
};

