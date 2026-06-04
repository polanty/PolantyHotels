import MotionCalendar from "../MotionCalendar/MotionCalendar";
import MotionSelect from "../MotionSelect/MotionSelect";

const GUEST_OPTIONS = ["2 Guests", "1 Guest", "3 Guests", "4 Guests"];

export default function SearchBar({
  destination,
  setDestination,
  destinationError,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  guests,
  setGuests,
  onSearch,
}) {
  return (
    <div className="heroSearch" aria-label="Hotel search bar">
      <div className="container heroSearch__container">
        <form className="searchCard" onSubmit={onSearch}>
          <div className="searchRow">
            {/* Destination */}
            <div className="searchCell searchCell--location">
              <label className="fieldRow">
                <span
                  className="material-symbols-outlined fieldRow__icon"
                  aria-hidden="true"
                >
                  location_on
                </span>

                <input
                  className={`input input--ghost ${
                    destinationError ? "input-error" : ""
                  }`}
                  placeholder="Destinations, cities, or hotels"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  aria-invalid={destinationError}
                  aria-describedby="destination-error"
                />
              </label>
            </div>

            {/* Check-in */}
            <div className="searchCell">
              <div className="fieldRow">
                <span
                  className="material-symbols-outlined fieldRow__icon"
                  aria-hidden="true"
                >
                  calendar_month
                </span>
                <MotionCalendar
                  value={checkIn}
                  onChange={setCheckIn}
                  placeholder="Check-in"
                  aria-label="Check-in date"
                />
              </div>
            </div>

            {/* Check-out */}
            <div className="searchCell">
              <div className="fieldRow">
                <span
                  className="material-symbols-outlined fieldRow__icon"
                  aria-hidden="true"
                >
                  calendar_month
                </span>
                <MotionCalendar
                  value={checkOut}
                  onChange={setCheckOut}
                  placeholder="Check-out"
                  aria-label="Check-out date"
                  minDate={checkIn}
                />
              </div>
            </div>

            {/* Guests */}
            <div className="searchCell">
              <div className="fieldRow">
                <span
                  className="material-symbols-outlined fieldRow__icon"
                  aria-hidden="true"
                >
                  group
                </span>
                <MotionSelect
                  value={guests}
                  onChange={setGuests}
                  options={GUEST_OPTIONS}
                  aria-label="Guests"
                />
              </div>
            </div>

            {/* CTA */}
            <div className="searchCell searchCell--cta">
              <button className="btn btn--primary btn--search" type="submit">
                Search
              </button>
            </div>
          </div>

          <p
            id="destination-error"
            className={`error-text ${destinationError ? "is-visible" : ""}`}
            aria-live="polite"
          >
            <span className="material-symbols-outlined error-text__icon" aria-hidden="true">
              error
            </span>
            <span>A destination must be provided.</span>
          </p>
        </form>
      </div>
    </div>
  );
}
