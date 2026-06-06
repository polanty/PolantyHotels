// import SearchBar from "../components/SearchBar";
import SearchBar from "../SearchBar/SearchBar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchComponent() {
  const navigate = useNavigate();

  const [destination, setDestination] = useState("");
  const [destinationError, setDestinationError] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  const countries = new Set([
    "france",
    "united kingdom",
    "usa",
    "united states",
    "germany",
    "spain",
  ]);

  function decideCityOrCountry(text) {
    const normalized = text.toLowerCase().trim();
    if (countries.has(normalized)) return { country: text };
    return { city: text };
  }

  const onSearch = (e) => {
    e.preventDefault();

    const dest = destination.trim();

    if (!dest || !/^[A-Za-z\s-]+$/.test(dest)) {
      setDestinationError(true);

      setTimeout(() => setDestinationError(false), 3000);

      return;
    }

    setDestinationError(false);

    const params = new URLSearchParams();
    const which = decideCityOrCountry(dest);

    if (which.city) params.set("city", which.city.toLowerCase());
    if (which.country) params.set("country", which.country.toLowerCase());

    params.set("page", "1");

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="index-search--holder">
      <SearchBar
        destination={destination}
        setDestination={setDestination}
        destinationError={destinationError}
        checkIn={checkIn}
        setCheckIn={setCheckIn}
        checkOut={checkOut}
        setCheckOut={setCheckOut}
        guests={guests}
        setGuests={setGuests}
        onSearch={onSearch}
      />
    </div>
  );
}
