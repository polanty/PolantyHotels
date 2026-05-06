// import SearchBar from "../components/SearchBar";
import AvailabilitySearch from "../Availability/Availability";
import { useState } from "react";

export default function AvailabilitySearchComponent() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState("2");

  const onSearch = (e) => {
    e.preventDefault();

    //Go to Booking page from Here
  };

  return (
    <AvailabilitySearch
      checkIn={checkIn}
      setCheckIn={setCheckIn}
      checkOut={checkOut}
      setCheckOut={setCheckOut}
      rooms={rooms}
      setRooms={setRooms}
      onSearch={onSearch}
    />
  );
}
