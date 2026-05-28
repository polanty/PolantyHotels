// import SearchBar from "../components/SearchBar";
import AvailabilitySearch from "../Availability/Availability";

export default function AvailabilitySearchComponent({
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  rooms,
  setRooms,
  showDateError,
}) {
  return (
    <AvailabilitySearch
      checkIn={checkIn}
      setCheckIn={setCheckIn}
      checkOut={checkOut}
      setCheckOut={setCheckOut}
      rooms={rooms}
      setRoomNumber={setRooms}
      showDateError={showDateError}
    />
  );
}
