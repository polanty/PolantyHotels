import { useEffect, useMemo, useRef, useState } from "react";

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDate(value) {
  if (!value) return null;

  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function toDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value, placeholder) {
  const date = toDate(value);

  if (!date) return placeholder;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getMonthDays(activeMonth) {
  const year = activeMonth.getFullYear();
  const month = activeMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
}

function isSameDay(firstDate, secondDate) {
  if (!firstDate || !secondDate) return false;

  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

export default function MotionCalendar({
  value,
  onChange,
  placeholder,
  ariaLabel,
  minDate,
  invalid = false,
}) {
  const wrapperRef = useRef(null);
  const selectedDate = toDate(value);
  const minDateValue = toDate(minDate);
  const [isOpen, setIsOpen] = useState(false);
  const [activeMonth, setActiveMonth] = useState(
    selectedDate || minDateValue || new Date(),
  );

  useEffect(() => {
    if (selectedDate) {
      setActiveMonth(selectedDate);
    }
  }, [value]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const monthDays = useMemo(() => getMonthDays(activeMonth), [activeMonth]);
  const minTime = minDateValue
    ? new Date(
        minDateValue.getFullYear(),
        minDateValue.getMonth(),
        minDateValue.getDate(),
      ).getTime()
    : null;
  const monthLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(activeMonth);

  const moveMonth = (direction) => {
    setActiveMonth(
      new Date(activeMonth.getFullYear(), activeMonth.getMonth() + direction, 1),
    );
  };

  const selectDate = (date) => {
    onChange(toDateValue(date));
    setIsOpen(false);
  };

  const today = new Date();

  return (
    <div className="motionCalendar" ref={wrapperRef}>
      <button
        type="button"
        className={`motionCalendar__trigger input input--ghost ${
          value ? "hasValue" : ""
        }`}
        onClick={() => setIsOpen((current) => !current)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-invalid={invalid}
      >
        {formatDisplayDate(value, placeholder)}
      </button>

      {isOpen && (
        <div
          className="motionCalendar__popover"
          role="dialog"
          aria-label={ariaLabel}
        >
          <div className="motionCalendar__head">
            <button
              type="button"
              className="motionCalendar__nav"
              onClick={() => moveMonth(-1)}
              aria-label="Previous month"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            <strong>{monthLabel}</strong>

            <button
              type="button"
              className="motionCalendar__nav"
              onClick={() => moveMonth(1)}
              aria-label="Next month"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <div className="motionCalendar__weekdays" aria-hidden="true">
            {WEEK_DAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="motionCalendar__grid">
            {monthDays.map((date) => {
              const dateValue = toDateValue(date);
              const isOutsideMonth = date.getMonth() !== activeMonth.getMonth();
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, today);
              const isDisabled = minTime !== null && date.getTime() < minTime;

              return (
                <button
                  key={dateValue}
                  type="button"
                  className={`motionCalendar__day ${
                    isOutsideMonth ? "outside" : ""
                  } ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                  onClick={() => selectDate(date)}
                  disabled={isDisabled}
                  aria-label={new Intl.DateTimeFormat("en-GB", {
                    dateStyle: "full",
                  }).format(date)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="motionCalendar__footer">
            <button type="button" onClick={() => onChange("")}>
              Clear
            </button>
            <button
              type="button"
              onClick={() => selectDate(new Date())}
              disabled={minTime !== null && today.getTime() < minTime}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
