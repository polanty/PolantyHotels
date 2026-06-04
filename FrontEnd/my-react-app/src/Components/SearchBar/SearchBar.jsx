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
                />
              </label>

              {destinationError && (
                <p className="error-text">A destination must be provided.</p>
              )}
            </div>

            {/* Check-in */}
            <div className="searchCell">
              <label className="fieldRow">
                <span
                  className="material-symbols-outlined fieldRow__icon"
                  aria-hidden="true"
                >
                  calendar_month
                </span>
                <input
                  className="input input--ghost"
                  type="date"
                  placeholder="Check-in"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  aria-label="Check-in date"
                />
              </label>
            </div>

            {/* Check-out */}
            <div className="searchCell">
              <label className="fieldRow">
                <span
                  className="material-symbols-outlined fieldRow__icon"
                  aria-hidden="true"
                >
                  calendar_month
                </span>
                <input
                  className="input input--ghost"
                  type="date"
                  placeholder="Check-out"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  aria-label="Check-out date"
                />
              </label>
            </div>

            {/* Guests */}
            <div className="searchCell">
              <label className="fieldRow">
                <span
                  className="material-symbols-outlined fieldRow__icon"
                  aria-hidden="true"
                >
                  group
                </span>
                <select
                  className="select select--ghost"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  aria-label="Guests"
                >
                  <option>2 Guests</option>
                  <option>1 Guest</option>
                  <option>3 Guests</option>
                  <option>4 Guests</option>
                </select>
              </label>
            </div>

            {/* CTA */}
            <div className="searchCell searchCell--cta">
              <button className="btn btn--primary btn--search" type="submit">
                Search
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
