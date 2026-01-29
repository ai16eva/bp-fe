import React, { useState } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';

interface DateTimePickerProps {
  value: Date | null;
  onChange: (value: Date) => void;
  min?: string | Date;
  className?: string;
}

interface CalendarDay {
  date: Dayjs;
  isCurrentMonth: boolean;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  min,
  className = '',
}) => {
  const [showPicker, setShowPicker] = useState<boolean>(false);

  const [uid] = useState(() => Math.random().toString(36).slice(2, 9));
  const hideClass = `hide-scrollbar-${uid}`;

  const initialDate = value ? dayjs(value) : dayjs().add(24, 'hours');

  const [selectedDate, setSelectedDate] = useState<Dayjs>(initialDate);
  const [selectedHour, setSelectedHour] = useState<number>(initialDate.hour());
  const [selectedMinute, setSelectedMinute] = useState<number>(
    initialDate.minute()
  );
  const [selectedSecond, setSelectedSecond] = useState<number>(
    initialDate.second()
  );

  const minDate: Dayjs = min ? dayjs(min) : dayjs();

  const generateCalendarDays = (): CalendarDay[] => {
    const startOfMonth = selectedDate.startOf('month');
    const endOfMonth = selectedDate.endOf('month');
    const startDay = startOfMonth.day();
    const daysInMonth = endOfMonth.date();

    const days: CalendarDay[] = [];

    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: startOfMonth.subtract(i + 1, 'day'),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: startOfMonth.date(i),
        isCurrentMonth: true,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: endOfMonth.add(i, 'day'),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
    updateDateTime(date, selectedHour, selectedMinute, selectedSecond);
  };

  const handleTimeChange = (hour: number, minute: number, second: number) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedSecond(second);
    updateDateTime(selectedDate, hour, minute, second);
  };

  const updateDateTime = (
    date: Dayjs,
    hour: number,
    minute: number,
    second: number
  ) => {
    const newDateTime = date.hour(hour).minute(minute).second(second);
    onChange(newDateTime.toDate());
  };

  const isDateDisabled = (date: Dayjs): boolean => {
    return date.isBefore(minDate, 'day');
  };

  const isToday = (date: Dayjs): boolean => {
    return date.isSame(dayjs(), 'day');
  };

  const isSelected = (date: Dayjs): boolean => {
    return date.isSame(selectedDate, 'day');
  };

  const calendarDays = generateCalendarDays();
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const seconds = Array.from({ length: 60 }, (_, i) => i);

  const hideScrollbarInline: React.CSSProperties = {
    msOverflowStyle: 'none' as any,
    scrollbarWidth: 'none' as any,
  };

  return (
    <div className={`relative ${className}`}>
      {showPicker && (
        <style>{`
        .${hideClass}::-webkit-scrollbar { display: none; }
      `}</style>
      )}

      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="w-full h-9 px-3 py-1.5 bg-background border border-input rounded-md flex items-center justify-between hover:border-foreground/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
      >
        <span className="text-foreground">
          {value
            ? dayjs(value).format('DD/MM/YYYY HH:mm:ss')
            : 'Choose ending time'}
        </span>
        <Calendar className="w-3.5 h-3.5 text-foreground/60" />
      </button>

      {showPicker && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPicker(false)}
          />

          <div className="absolute top-full left-0 mt-1 z-50 bg-background rounded-lg shadow-xl border border-input overflow-hidden">
            <div className="flex">
              <div className="p-3 border-r border-input">
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedDate(selectedDate.subtract(1, 'month'))
                    }
                    className="p-0.5 hover:bg-accent rounded transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-foreground" />
                  </button>
                  <h3 className="font-medium text-sm text-foreground">
                    {selectedDate.format('MMM YYYY')}
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedDate(selectedDate.add(1, 'month'))
                    }
                    className="p-0.5 hover:bg-accent rounded transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-foreground" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div
                      key={day}
                      className="text-center text-[10px] font-medium text-muted-foreground py-0.5 w-7"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5">
                  {calendarDays.map((day, idx) => {
                    const disabled = isDateDisabled(day.date);
                    const today = isToday(day.date);
                    const selected = isSelected(day.date);

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => !disabled && handleDateSelect(day.date)}
                        disabled={disabled}
                        className={`
                        w-7 h-7 text-xs rounded transition-all
                        ${!day.isCurrentMonth ? 'text-muted-foreground/50' : 'text-foreground'}
                        ${disabled ? 'cursor-not-allowed opacity-30' : 'hover:bg-accent'}
                        ${selected ? 'bg-primary text-primary-foreground hover:bg-primary/90 font-medium' : ''}
                        ${today && !selected ? 'border border-primary font-medium' : ''}
                      `}
                      >
                        {day.date.date()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 w-44">
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">
                    Time
                  </span>
                </div>

                <div className="flex gap-1.5">
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground mb-0.5 block">
                      Hour
                    </label>
                    <div
                      className={`${hideClass} h-28 overflow-y-auto border border-input rounded`}
                      style={hideScrollbarInline}
                    >
                      {hours.map((hour) => (
                        <button
                          key={hour}
                          type="button"
                          onClick={() =>
                            handleTimeChange(
                              hour,
                              selectedMinute,
                              selectedSecond
                            )
                          }
                          className={`
                          w-full px-2 py-0.5 text-xs text-center hover:bg-accent transition-colors
                          ${selectedHour === hour ? 'bg-primary text-primary-foreground hover:bg-primary/90 font-medium' : 'text-foreground'}
                        `}
                        >
                          {String(hour).padStart(2, '0')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground mb-0.5 block">
                      Min
                    </label>
                    <div
                      className={`${hideClass} h-28 overflow-y-auto border border-input rounded`}
                      style={hideScrollbarInline}
                    >
                      {minutes.map((minute) => (
                        <button
                          key={minute}
                          type="button"
                          onClick={() =>
                            handleTimeChange(
                              selectedHour,
                              minute,
                              selectedSecond
                            )
                          }
                          className={`
                          w-full px-2 py-0.5 text-xs text-center hover:bg-accent transition-colors
                          ${selectedMinute === minute ? 'bg-primary text-primary-foreground hover:bg-primary/90 font-medium' : 'text-foreground'}
                        `}
                        >
                          {String(minute).padStart(2, '0')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground mb-0.5 block">
                      Sec
                    </label>
                    <div
                      className={`${hideClass} h-28 overflow-y-auto border border-input rounded`}
                      style={hideScrollbarInline}
                    >
                      {seconds.map((second) => (
                        <button
                          key={second}
                          type="button"
                          onClick={() =>
                            handleTimeChange(
                              selectedHour,
                              selectedMinute,
                              second
                            )
                          }
                          className={`
                          w-full px-2 py-0.5 text-xs text-center hover:bg-accent transition-colors
                          ${selectedSecond === second ? 'bg-primary text-primary-foreground hover:bg-primary/90 font-medium' : 'text-foreground'}
                        `}
                        >
                          {String(second).padStart(2, '0')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setShowPicker(false)}
                    className="w-full px-2 py-1 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DateTimePicker;
