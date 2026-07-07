import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminEndpoints } from "../axios/axios.endpoint";
import { getErrorMessage } from "../features/hotels/hotelFormUtils";

const roomTypeOptions = ["Single", "Double", "Suite", "Deluxe", "Family"];
const currencyOptions = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"];

function toDateInput(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return new Date(value).toISOString().slice(0, 10);
}

function getHotelFromResponse(response) {
  return response.data?.data?.hotel || null;
}

function buildHotelForm(hotel) {
  return {
    name: hotel.name || "",
    address: hotel.address || "",
    city: hotel.city || "",
    country: hotel.country || "",
    postal_code: hotel.postal_code || "",
    latitude: hotel.latitude ?? "",
    longitude: hotel.longitude ?? "",
    email: hotel.email || "",
  };
}

function buildRoomForms(hotel) {
  return (hotel.RoomRef || []).map((room) => {
    const roomType = room.room_type_id || {};
    const pricing = roomType.pricing?.[0] || {};

    return {
      id: room._id,
      isAvailable: room.isAvailable ?? 1,
      images: room.images || [],
      roomTypeId: roomType._id || "",
      pricingId: pricing._id || "",
      roomTypeName: roomType.name || "Deluxe",
      roomTypeDescription: roomType.description || "",
      capacity: roomType.capacity ?? 1,
      bed_configuration: roomType.bed_configuration || "",
      size_sqm: roomType.size_sqm ?? 21,
      base_price_per_night: pricing.base_price_per_night ?? "",
      currency: pricing.currency || "USD",
      effective_date: toDateInput(pricing.effective_date),
    };
  });
}

export default function AdminHotelEditPage() {
  const { hotelId } = useParams();
  const [hotelForm, setHotelForm] = useState(null);
  const [roomForms, setRoomForms] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadHotel() {
      setStatus("loading");
      setMessage("");

      try {
        const response = await adminEndpoints.getHotel(hotelId);
        const hotel = getHotelFromResponse(response);

        if (!hotel) {
          throw new Error("Hotel was not found.");
        }

        setHotelForm(buildHotelForm(hotel));
        setRoomForms(buildRoomForms(hotel));
        setStatus("succeeded");
      } catch (error) {
        setStatus("failed");
        setMessage(getErrorMessage(error));
      }
    }

    loadHotel();
  }, [hotelId]);

  const updateHotelField = (event) => {
    const { name, value } = event.target;
    setHotelForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const updateRoomField = (index, field, value) => {
    setRoomForms((currentRooms) =>
      currentRooms.map((room, roomIndex) =>
        roomIndex === index ? { ...room, [field]: value } : room,
      ),
    );
  };

  const saveHotel = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      await adminEndpoints.updateHotel(hotelId, {
        ...hotelForm,
        latitude: Number(hotelForm.latitude),
        longitude: Number(hotelForm.longitude),
        location: {
          type: "Point",
          coordinates: [Number(hotelForm.longitude), Number(hotelForm.latitude)],
        },
      });
      setStatus("succeeded");
      setMessage("Hotel details updated.");
    } catch (error) {
      setStatus("failed");
      setMessage(getErrorMessage(error));
    }
  };

  const saveRoom = async (room) => {
    setStatus("loading");
    setMessage("");

    try {
      await adminEndpoints.updateRoom(room.id, {
        isAvailable: Number(room.isAvailable),
      });

      if (room.roomTypeId) {
        await adminEndpoints.updateRoomType(room.roomTypeId, {
          name: room.roomTypeName,
          description: room.roomTypeDescription,
          capacity: Number(room.capacity),
          bed_configuration: room.bed_configuration,
          size_sqm: Number(room.size_sqm),
        });
      }

      if (room.pricingId) {
        await adminEndpoints.updatePricing(room.pricingId, {
          base_price_per_night: Number(room.base_price_per_night),
          currency: room.currency,
          effective_date: room.effective_date,
        });
      }

      setStatus("succeeded");
      setMessage("Room details updated.");
    } catch (error) {
      setStatus("failed");
      setMessage(getErrorMessage(error));
    }
  };

  return (
    <section className="usersPanel fullPanel">
      <div className="panelHeader">
        <div>
          <p className="adminEyebrow">Edit</p>
          <h2>Hotel details</h2>
        </div>
        <Link className="navLink" to="/admin/hotels">
          Back to hotels
        </Link>
      </div>

      {message && (
        <p
          className={
            status === "failed" ? "authMessage error" : "authMessage success"
          }
        >
          {message}
        </p>
      )}

      {status === "loading" && !hotelForm && <p>Loading hotel...</p>}

      {hotelForm && (
        <form className="loginForm twoColumnForm" onSubmit={saveHotel}>
          <fieldset>
            <legend>Hotel</legend>
            {[
              ["name", "Hotel name"],
              ["address", "Address"],
              ["city", "City"],
              ["country", "Country"],
              ["postal_code", "Postal code"],
              ["email", "Hotel email"],
            ].map(([name, label]) => (
              <label htmlFor={name} key={name}>
                {label}
                <input
                  id={name}
                  name={name}
                  type={name === "email" ? "email" : "text"}
                  value={hotelForm[name]}
                  onChange={updateHotelField}
                  required
                />
              </label>
            ))}
            <label htmlFor="latitude">
              Latitude
              <input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                value={hotelForm.latitude}
                onChange={updateHotelField}
                required
              />
            </label>
            <label htmlFor="longitude">
              Longitude
              <input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                value={hotelForm.longitude}
                onChange={updateHotelField}
                required
              />
            </label>
          </fieldset>
          <div className="formActions">
            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Saving..." : "Save hotel details"}
            </button>
          </div>
        </form>
      )}

      <div className="roomFormList">
        {roomForms.map((room, index) => (
          <article className="roomFormCard" key={room.id}>
            <div className="panelHeader">
              <h3>Room {index + 1}</h3>
              <button
                type="button"
                disabled={status === "loading"}
                onClick={() => saveRoom(room)}
              >
                Save room
              </button>
            </div>

            {room.images.length > 0 && (
              <div className="imagePreviewGrid">
                {room.images.map((image) => (
                  <figure key={image}>
                    <img src={image} alt={`Room ${index + 1}`} />
                  </figure>
                ))}
              </div>
            )}

            <div className="loginForm">
              <div className="inlineFields">
                <label htmlFor={`roomTypeName-${room.id}`}>
                  Room type
                  <select
                    id={`roomTypeName-${room.id}`}
                    value={room.roomTypeName}
                    onChange={(event) =>
                      updateRoomField(index, "roomTypeName", event.target.value)
                    }
                  >
                    {roomTypeOptions.map((roomType) => (
                      <option key={roomType} value={roomType}>
                        {roomType}
                      </option>
                    ))}
                  </select>
                </label>
                <label htmlFor={`capacity-${room.id}`}>
                  Capacity
                  <input
                    id={`capacity-${room.id}`}
                    type="number"
                    min="1"
                    max="3"
                    value={room.capacity}
                    onChange={(event) =>
                      updateRoomField(index, "capacity", event.target.value)
                    }
                    required
                  />
                </label>
                <label htmlFor={`isAvailable-${room.id}`}>
                  Available rooms
                  <input
                    id={`isAvailable-${room.id}`}
                    type="number"
                    min="0"
                    value={room.isAvailable}
                    onChange={(event) =>
                      updateRoomField(index, "isAvailable", event.target.value)
                    }
                    required
                  />
                </label>
              </div>

              <label htmlFor={`roomTypeDescription-${room.id}`}>
                Description
                <textarea
                  id={`roomTypeDescription-${room.id}`}
                  value={room.roomTypeDescription}
                  onChange={(event) =>
                    updateRoomField(index, "roomTypeDescription", event.target.value)
                  }
                  required
                />
              </label>

              <div className="inlineFields">
                <label htmlFor={`bed_configuration-${room.id}`}>
                  Bed configuration
                  <input
                    id={`bed_configuration-${room.id}`}
                    value={room.bed_configuration}
                    onChange={(event) =>
                      updateRoomField(index, "bed_configuration", event.target.value)
                    }
                    required
                  />
                </label>
                <label htmlFor={`size_sqm-${room.id}`}>
                  Size sqm
                  <input
                    id={`size_sqm-${room.id}`}
                    type="number"
                    min="1"
                    value={room.size_sqm}
                    onChange={(event) =>
                      updateRoomField(index, "size_sqm", event.target.value)
                    }
                    required
                  />
                </label>
                <label htmlFor={`base_price_per_night-${room.id}`}>
                  Base price per night
                  <input
                    id={`base_price_per_night-${room.id}`}
                    type="number"
                    min="0"
                    value={room.base_price_per_night}
                    onChange={(event) =>
                      updateRoomField(index, "base_price_per_night", event.target.value)
                    }
                    required
                  />
                </label>
              </div>

              <div className="inlineFields">
                <label htmlFor={`currency-${room.id}`}>
                  Currency
                  <select
                    id={`currency-${room.id}`}
                    value={room.currency}
                    onChange={(event) =>
                      updateRoomField(index, "currency", event.target.value)
                    }
                  >
                    {currencyOptions.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </label>
                <label htmlFor={`effective_date-${room.id}`}>
                  Effective date
                  <input
                    id={`effective_date-${room.id}`}
                    type="date"
                    value={room.effective_date}
                    onChange={(event) =>
                      updateRoomField(index, "effective_date", event.target.value)
                    }
                    required
                  />
                </label>
              </div>
            </div>
          </article>
        ))}
        {status !== "loading" && roomForms.length === 0 && (
          <p>No rooms are attached to this hotel yet.</p>
        )}
      </div>
    </section>
  );
}
