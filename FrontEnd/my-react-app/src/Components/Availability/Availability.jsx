export default function AvailabilitySearch({
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  rooms,
  setRoomNumber,
  showDateError = false,
}) {
  return (
    <div
      className={`heroSearch availabilitySearch ${
        showDateError ? "availabilitySearch--error" : ""
      }`}
      aria-label="Hotel availability search"
    >
      <div className="heroSearch__container">
        <form className="searchCard">
          <div className="searchRow">
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
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  aria-invalid={showDateError && !checkIn}
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
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  aria-invalid={showDateError && !checkOut}
                  aria-label="Check-out date"
                />
              </label>
            </div>

            {/* Rooms */}
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
                  value={rooms}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  aria-label="Rooms"
                >
                  <option>1 room</option>
                  <option>2 rooms</option>
                  <option>3 rooms</option>
                  <option>4 rooms</option>
                </select>
              </label>
            </div>

            {/* CTA */}
            {/* <div className="searchCell searchCell--cta">
              <button className="btn btn--primary btn--search" type="submit">
                change search
              </button>
            </div> */}
          </div>
        </form>
      </div>
    </div>
  );
}
