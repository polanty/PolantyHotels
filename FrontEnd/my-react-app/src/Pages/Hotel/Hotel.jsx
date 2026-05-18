// Encrypt the hotel ID so not to expose the ID
// Return each individual hotel along with its mapped location

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { selectIsAuthed, selectUser } from "../../store/auth/auth.selectors";
import {
  selectSelectedHotel,
  selectSelectedHotelStatus,
  selectSelectedHotelError,
} from "../../store/auth/auth.selectors";

import { hotelDetails } from "../../store/auth/auth.thunks";

import { NormalizeAmenities } from "../../utils/utils";
import SearchComponent from "../../Components/SearchBarComponent/SearchBarComponent";
import Map from "../../api/MapView";
import HotelInfoCards from "../../Components/HotelInfo/HotelInfo";
import AvailabilitySearchComponent from "../../Components/AvaialaibilityComponent/AvailabilityComponent";

import "./Hotel.css";

function formatAmenityName(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getAmenityIcon(name) {
  const value = String(name).toLowerCase();

  if (value.includes("tv")) return "tv";
  if (value.includes("wifi")) return "wifi";
  if (value.includes("safe")) return "lock";
  if (value.includes("parking")) return "local_parking";
  if (value.includes("pool")) return "pool";
  if (value.includes("pet")) return "pets";
  if (value.includes("air")) return "mode_fan";
  if (value.includes("breakfast")) return "restaurant";
  if (value.includes("gym")) return "fitness_center";
  if (value.includes("spa")) return "spa";

  return "check_circle";
}

function buildGalleryImages(hotel) {
  const roomImages =
    hotel?.RoomRef?.flatMap((room) =>
      Array.isArray(room.images) ? room.images : [],
    ) || [];

  const normalizedRoomImages = roomImages
    .map((img) => {
      if (typeof img === "string") return img;
      if (img?.url) return img.url;
      if (img?.secure_url) return img.secure_url;
      return null;
    })
    .filter(Boolean);

  if (normalizedRoomImages.length >= 5) {
    return normalizedRoomImages.slice(0, 5);
  }

  const fallback = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80",
  ];

  return [...normalizedRoomImages, ...fallback].slice(0, 5);
}

function getLowestPrice(rooms) {
  if (!Array.isArray(rooms) || rooms.length === 0) return null;

  const prices = rooms
    .flatMap((room) => room?.room_type_id?.pricing || [])
    .map((price) => Number(price?.base_price_per_night))
    .filter((price) => Number.isFinite(price));

  if (prices.length === 0) return null;

  return Math.min(...prices);
}

function mapRoom(room) {
  const roomType = room?.room_type_id || {};
  const firstPrice = roomType?.pricing?.[0];

  return {
    id: room?.id || room?._id,
    name: roomType?.name || "Room",
    description: roomType?.description || "Comfortable room",
    capacity: roomType?.capacity || 0,
    bedConfiguration: roomType?.bed_configuration || "Bed details unavailable",
    size: roomType?.size_sqm || null,
    price: Number(firstPrice?.base_price_per_night || 0),
    currency: firstPrice?.currency || "GBP",
    isAvailable: Number(room?.isAvailable || 0),
  };
}

function Spinner() {
  return (
    <div className="hotelDetailsSpinnerWrap" role="status" aria-live="polite">
      <div className="hotelDetailsSpinner" />
      <p>Loading hotel details...</p>
    </div>
  );
}

function Gallery({ images, hotelName }) {
  const [activeImage, setActiveImage] = useState(images[0] || "");

  useEffect(() => {
    setActiveImage(images[0] || "");
  }, [images]);

  return (
    <section className="gallerySection" aria-label="Hotel gallery">
      <div className="galleryGrid">
        <div className="galleryMain">
          <img src={activeImage} alt={hotelName} className="galleryMainImg" />
        </div>

        <div className="gallerySide">
          {images.slice(0, 4).map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={`galleryThumbBtn ${
                activeImage === image ? "active" : ""
              }`}
              onClick={() => setActiveImage(image)}
            >
              <img
                src={image}
                alt={`${hotelName} view ${index + 1}`}
                className="galleryThumbImg"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function BookingCard({ hotel, rooms, lowestPrice, onBook }) {
  const availableRooms = rooms.filter((room) => room.isAvailable > 0).length;

  return (
    <aside className="bookingSidebar">
      <div className="bookingCard">
        <div className="bookingCardTop">
          <p className="bookingCardLabel">Reserve your stay</p>
          <h3 className="bookingCardTitle">Good choice for your trip</h3>
        </div>

        <div className="bookingPriceBlock">
          <span className="bookingPricePrefix">From</span>

          <p className="bookingPrice">
            {lowestPrice ? `£${lowestPrice}` : "Check rates"}
          </p>

          <span className="bookingPriceSuffix">per night</span>
        </div>

        <div className="bookingFacts">
          <div className="bookingFact">
            <span className="material-symbols-outlined">bed</span>
            <span>{rooms.length} room types</span>
          </div>

          <div className="bookingFact">
            <span className="material-symbols-outlined">event_available</span>
            <span>{availableRooms} room types available</span>
          </div>

          <div className="bookingFact">
            <span className="material-symbols-outlined">location_on</span>
            <span>
              {hotel.city}, {hotel.country}
            </span>
          </div>
        </div>

        <button type="button" className="bookNowBtn" onClick={onBook}>
          See availability
        </button>

        <button type="button" className="saveBtn">
          Save property
        </button>
      </div>

      <div className="sidebarInfoCard">
        <h4>Property highlights</h4>

        <ul className="sidebarList">
          <li>Central location</li>
          <li>Flexible room options</li>
          <li>Easy booking flow</li>
        </ul>
      </div>
    </aside>
  );
}

export default function HotelDetailsPage() {
  const { hotelId } = useParams();

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showPaymentCancelled, setShowPaymentCancelled] = useState(false);

  const isAuthed = useSelector(selectIsAuthed);
  const userData = useSelector(selectUser);

  const hotel = useSelector(selectSelectedHotel);
  const hotelStatus = useSelector(selectSelectedHotelStatus);
  const hotelError = useSelector(selectSelectedHotelError);

  const loading = hotelStatus === "loading";
  const error = hotelError;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get("payment");

    if (paymentStatus === "cancelled") {
      setShowPaymentCancelled(true);

      navigate(location.pathname, {
        replace: true,
      });
    }
  }, [location.search, location.pathname, navigate]);

  //Dispatch for Hotel Call
  useEffect(() => {
    if (!hotelId) return;

    dispatch(hotelDetails(hotelId));
  }, [dispatch, hotelId]);

  const galleryImages = useMemo(() => buildGalleryImages(hotel), [hotel]);

  const amenityList = useMemo(
    () => NormalizeAmenities(hotel?.amenities),
    [hotel],
  );

  const rooms = useMemo(() => (hotel?.RoomRef || []).map(mapRoom), [hotel]);

  const lowestPrice = useMemo(() => getLowestPrice(hotel?.RoomRef), [hotel]);

  const maxGuests = useMemo(() => {
    if (!rooms.length) return 0;

    return Math.max(...rooms.map((room) => room.capacity || 0));
  }, [rooms]);

  const bookHotel = () => {
    if (!isAuthed) {
      navigate("/login", {
        state: { from: location },
      });

      return;
    }

    const firstAvailableRoom = rooms.find((room) => room.isAvailable > 0);

    if (!firstAvailableRoom) {
      return;
    }

    navigate(`/booking/${hotelId}`, {
      state: {
        hotel,
        room: firstAvailableRoom,
        user: userData,
      },
    });
  };

  const handleRoomReserve = (room) => {
    if (!isAuthed) {
      navigate("/login", {
        state: { from: location },
      });

      return;
    }

    navigate(`/booking/${hotelId}/${room.id}`, {
      state: {
        hotel,
        room,
        user: userData,
      },
    });
  };

  if (!hotelId) {
    return (
      <div className="hotelDetailsPage dark">
        <div className="hotelDetailsShell">
          <div className="hotelDetailsStateCard" role="alert">
            <h2>Unable to load hotel</h2>
            <p>No hotel id was provided.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="hotelDetailsPage dark">
        <div className="hotelDetailsShell">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hotelDetailsPage dark">
        <div className="hotelDetailsShell">
          <div className="hotelDetailsStateCard" role="alert">
            <h2>Unable to load hotel</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="hotelDetailsPage dark">
        <div className="hotelDetailsShell">
          <div className="hotelDetailsStateCard">
            <h2>Hotel not found</h2>
          </div>
        </div>
      </div>
    );
  }

  const mapLat = Number(hotel.latitude) || 53.4;
  const mapLon = Number(hotel.longitude) || -3.0;

  return (
    <div className="hotelDetailsPage dark">
      <div className="hotelDetailsShell">
        <div className="index-search--holder">
          <SearchComponent />
        </div>

        {showPaymentCancelled && (
          <div className="paymentCancelledBanner" role="alert">
            <div className="paymentCancelledIcon">
              <span className="material-symbols-outlined">info</span>
            </div>

            <div className="paymentCancelledContent">
              <h2>Payment cancelled</h2>
              <p>
                Your booking was not completed. You can review the room details
                and try again when you are ready.
              </p>
            </div>

            <button
              type="button"
              className="paymentCancelledClose"
              onClick={() => setShowPaymentCancelled(false)}
              aria-label="Dismiss payment cancellation message"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        <nav className="hotelBreadcrumbs" aria-label="Breadcrumbs">
          <span>Home</span>
          <span>/</span>
          <span>{hotel.country}</span>
          <span>/</span>
          <span>{hotel.city}</span>
          <span>/</span>
          <span className="crumbActive">{hotel.name}</span>
        </nav>

        <header className="hotelHeroHeader">
          <div className="hotelHeroMain">
            <div className="hotelTitleRow">
              <h1 className="hotelTitle">{hotel.name}</h1>

              <div className="hotelRatingBadge">
                <span className="material-symbols-outlined">star</span>
                <span>{Number(hotel.ratingsAverage || 0).toFixed(1)}</span>
              </div>
            </div>

            <div className="hotelAddressRow">
              <span className="material-symbols-outlined">location_on</span>
              <p>
                {hotel.address}, {hotel.city}, {hotel.country}
              </p>
            </div>

            <div className="hotelQuickFacts">
              <span className="quickFactChip">
                <span className="material-symbols-outlined">apartment</span>
                Hotel
              </span>

              <span className="quickFactChip">
                <span className="material-symbols-outlined">king_bed</span>
                {rooms.length} room types
              </span>

              <span className="quickFactChip">
                <span className="material-symbols-outlined">groups</span>
                Up to {maxGuests} guests
              </span>
            </div>
          </div>

          <div className="hotelHeroActions">
            <button type="button" className="heroGhostBtn">
              Save
            </button>

            <button
              type="button"
              className="heroPrimaryBtn"
              onClick={bookHotel}
            >
              Reserve
            </button>
          </div>
        </header>

        <Gallery images={galleryImages} hotelName={hotel.name} />

        <div className="hotelContentLayout">
          <main className="hotelMainColumn">
            <section className="hotelSection">
              <h2 className="sectionTitle">About this property</h2>

              <p className="overviewText">
                {hotel.name} is located in {hotel.city}, {hotel.country}. The
                property offers a polished stay experience with comfortable
                accommodation, easy access to the city, and a selection of room
                types for different guests.
              </p>

              <div className="overviewStats">
                <div className="statCard">
                  <span className="material-symbols-outlined">hotel</span>

                  <div>
                    <strong>{rooms.length}</strong>
                    <p>Room options</p>
                  </div>
                </div>

                <div className="statCard">
                  <span className="material-symbols-outlined">payments</span>

                  <div>
                    <strong>{lowestPrice ? `£${lowestPrice}` : "N/A"}</strong>
                    <p>Starting price</p>
                  </div>
                </div>

                <div className="statCard">
                  <span className="material-symbols-outlined">rate_review</span>

                  <div>
                    <strong>{hotel.ratingsQuantity || 0}</strong>
                    <p>Reviews</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="hotelSection">
              <h2 className="sectionTitle">Most popular facilities</h2>

              <div className="amenitiesGrid">
                {amenityList.length > 0 ? (
                  amenityList.map((amenity) => (
                    <div key={amenity.id} className="amenityCard">
                      <span className="material-symbols-outlined amenityCardIcon">
                        {getAmenityIcon(amenity.name)}
                      </span>

                      <div>
                        <h3>{formatAmenityName(amenity.name)}</h3>

                        {amenity.description ? (
                          <p>{amenity.description}</p>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="mutedText">No amenities listed yet.</p>
                )}
              </div>
            </section>

            <section className="hotelSection">
              <h2 className="sectionTitle">Available rooms</h2>

              <div className="roomsTableWrap">
                <AvailabilitySearchComponent />

                <table className="roomsTable">
                  <thead>
                    <tr>
                      <th>Room type</th>
                      <th>Sleeps</th>
                      <th>Beds</th>
                      <th>Size</th>
                      <th>Price</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room.id}>
                        <td>
                          <div className="roomNameCell">
                            <strong>{room.name}</strong>
                            <p>{room.description}</p>
                          </div>
                        </td>

                        <td>{room.capacity || "-"}</td>
                        <td>{room.bedConfiguration}</td>
                        <td>{room.size ? `${room.size} m²` : "-"}</td>

                        <td className="roomPriceCell">
                          {room.price > 0 ? `£${room.price}` : "Check rate"}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="roomSelectBtn"
                            disabled={room.isAvailable < 1}
                            onClick={() => handleRoomReserve(room)}
                          >
                            {room.isAvailable > 0 ? "Reserve" : "Sold out"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="hotelSection twoColSection">
              <div className="infoPanel">
                <h2 className="sectionTitle">Property information</h2>

                <ul className="infoList">
                  <li>
                    <strong>Email:</strong> {hotel.email || "Not available"}
                  </li>

                  <li>
                    <strong>Postal code:</strong>{" "}
                    {hotel.postal_code || "Not available"}
                  </li>

                  <li>
                    <strong>Latitude:</strong> {hotel.latitude || "N/A"}
                  </li>

                  <li>
                    <strong>Longitude:</strong> {hotel.longitude || "N/A"}
                  </li>
                </ul>
              </div>

              <div className="infoPanel">
                <h2 className="sectionTitle">House rules</h2>

                <ul className="infoList">
                  <li>Check-in from 15:00</li>
                  <li>Check-out until 11:00</li>
                  <li>Children welcome</li>
                  <li>Availability depends on selected room type</li>
                </ul>
              </div>
            </section>

            <section className="hotelSection">
              <h2 className="sectionTitle">Location</h2>

              <div className="mapPlaceholder">
                <Map lat={mapLat} lon={mapLon} />

                <span className="material-symbols-outlined">map</span>

                <p>
                  {hotel.address}, {hotel.city}, {hotel.country}
                </p>
              </div>
            </section>

            <HotelInfoCards hotel={hotel} />
          </main>

          <BookingCard
            hotel={hotel}
            rooms={rooms}
            lowestPrice={lowestPrice}
            onBook={bookHotel}
          />
        </div>
      </div>
    </div>
  );
}
