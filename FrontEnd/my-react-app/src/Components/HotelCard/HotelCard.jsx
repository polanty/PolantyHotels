/**
 * Small reusable star icon
 */
function Star({ filled }) {
  return (
    <span
      className={`material-symbols-outlined starIcon ${filled ? "filled" : ""}`}
      aria-hidden="true"
    >
      star
    </span>
  );
}

/**
 * Map backend amenity names to Material Symbols icons where possible.
 * Fallback is "check_circle".
 */
function getAmenityIcon(amenity) {
  const value = String(amenity).trim();

  const iconMap = {
    WiFi: "wifi",
    Air_Conditioning: "mode_fan",
    Flat_Screen_TV: "full_hd",
    Minibar: "table_bar",
    Coffee_Maker: "coffee_maker",
    Hair_Dryer: "health_and_beauty",
    Bathrobes: "dry_cleaning",
    Work_Desk: "desk",
    Balcony: "balcony",
    Smart_TV: "connected_tv",
    Espresso_Machine: "emoji_food_beverage",
    Restaurant: "restaurant",
    Bar: "sports_bar",
    Gym: "exercise",
    Swimming_Pool: "pool",
    Safe: "security",
    Spa: "spa",
    Business_Center: "business_center",
    Meeting_Rooms: "meeting_room",
    Parking: "garage",
    Room_Service: "room_service",
    Concierge: "concierge",
    Airport_Shuttle: "airport_shuttle",
    Laundry_Service: "iron",
    Pet_Friendly: "pets",
  };

  return iconMap[value] || "check_circle";
}

/**
 * Normal hotel card
 */
function HotelCard({ hotel, onToggleLike }) {
  return (
    <article className="hotelCard">
      <div className="hotelCardMedia">
        <img
          className="hotelCardImg"
          src={hotel.img}
          alt={hotel.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.net/600x600.png";
          }}
        />

        <button
          type="button"
          className={`likeBtn ${hotel.liked ? "liked" : ""}`}
          onClick={() => onToggleLike(hotel.id)}
          aria-label={
            hotel.liked ? "Remove from favourites" : "Add to favourites"
          }
        >
          <span className="material-symbols-outlined">
            {hotel.liked ? "favorite" : "favorite_border"}
          </span>
        </button>
      </div>

      <div className="hotelCardBody">
        <div className="hotelCardTop">
          <h3 className="hotelName">{hotel.name}</h3>

          <div className="ratingPill" aria-label={`Rating ${hotel.rating}`}>
            <Star filled />
            <span className="ratingNumber">
              {Number(hotel.rating).toFixed(1)}
            </span>
          </div>
        </div>

        <p className="hotelMeta">{hotel.locationText}</p>

        <div className="amenitiesRow" aria-label="Amenities">
          {hotel.amenities.length > 0 ? (
            hotel.amenities.map((amenity, index) => (
              <span
                key={`${amenity}-${index}`}
                className="material-symbols-outlined amenityIcon"
                title={amenity}
              >
                {getAmenityIcon(amenity)}
              </span>
            ))
          ) : (
            <span className="hotelMeta">No amenities listed</span>
          )}
        </div>

        <div className="hotelCardFooter">
          <p className="price">
            {hotel.price > 0 ? (
              <>
                ${hotel.price}{" "}
                <span className="priceSuffix">{hotel.priceSuffix}</span>
              </>
            ) : (
              <span className="priceSuffix">Price unavailable</span>
            )}
          </p>

          <button type="button" className="primaryBtn">
            View Deal
          </button>
        </div>
      </div>
    </article>
  );
}

export default HotelCard;
