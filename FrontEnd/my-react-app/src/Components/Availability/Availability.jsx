import MotionCalendar from "../MotionCalendar/MotionCalendar";
import MotionSelect from "../MotionSelect/MotionSelect";

const ROOM_OPTIONS = ["1 room", "2 rooms", "3 rooms", "4 rooms"];

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
                  invalid={showDateError && !checkIn}
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
                  invalid={showDateError && !checkOut}
                  aria-label="Check-out date"
                  minDate={checkIn}
                />
              </div>
            </div>

            {/* Rooms */}
            <div className="searchCell">
              <div className="fieldRow">
                <span
                  className="material-symbols-outlined fieldRow__icon"
                  aria-hidden="true"
                >
                  group
                </span>
                <MotionSelect
                  value={rooms}
                  onChange={setRoomNumber}
                  options={ROOM_OPTIONS}
                  aria-label="Rooms"
                />
              </div>
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
