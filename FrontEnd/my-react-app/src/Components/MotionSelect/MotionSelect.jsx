import { useEffect, useRef, useState } from "react";

export default function MotionSelect({ value, onChange, options, ariaLabel }) {
  const wrapperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

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

  const selectOption = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="motionSelect" ref={wrapperRef}>
      <button
        type="button"
        className="motionSelect__trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{value}</span>
      </button>

      {isOpen && (
        <div className="motionSelect__popover" role="listbox" aria-label={ariaLabel}>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`motionSelect__option ${
                option === value ? "selected" : ""
              }`}
              onClick={() => selectOption(option)}
              role="option"
              aria-selected={option === value}
            >
              <span>{option}</span>
              {option === value && (
                <span className="material-symbols-outlined">check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
