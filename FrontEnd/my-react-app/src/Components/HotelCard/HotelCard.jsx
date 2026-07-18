import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { NormalizeAmenities } from "../../utils/utils";

//Small reusable star icon

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

//  Map backend amenity names to Material Symbols icons where possible.
//   Fallback is "check_circle".

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

//Normal hotel card

function HotelCard({ hotel, onToggleLike }) {
  const navigate = useNavigate();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  const carouselImages = useMemo(() => {
    const images = Array.isArray(hotel?.images) ? hotel.images : [];
    const normalizedImages = images.filter(Boolean);

    if (normalizedImages.length > 0) {
      return normalizedImages;
    }

    return [hotel.img || "https://placehold.net/600x600.png"];
  }, [hotel]);

  const hasMultipleImages = carouselImages.length > 1;
  const activeImage = carouselImages[activeImageIndex] || carouselImages[0];

  useEffect(() => {
    setActiveImageIndex(0);
  }, [hotel.id]);

  const handleViewDeal = () => {
    navigate(`/hotels/${hotel.id}`);
  };

  const showPreviousImage = () => {
    setActiveImageIndex((currentIndex) =>
      currentIndex === 0 ? carouselImages.length - 1 : currentIndex - 1,
    );
  };

  const showNextImage = () => {
    setActiveImageIndex((currentIndex) =>
      currentIndex === carouselImages.length - 1 ? 0 : currentIndex + 1,
    );
  };

  const handleTouchStart = (event) => {
    if (!hasMultipleImages) return;

    setTouchStartX(event.touches[0].clientX);
  };

  const handleTouchEnd = (event) => {
    if (!hasMultipleImages || touchStartX === null) return;

    const touchEndX = event.changedTouches[0].clientX;
    const swipeDistance = touchStartX - touchEndX;
    const minimumSwipeDistance = 40;

    if (swipeDistance > minimumSwipeDistance) {
      showNextImage();
    }

    if (swipeDistance < -minimumSwipeDistance) {
      showPreviousImage();
    }

    setTouchStartX(null);
  };

  const amenityList = useMemo(
    () => NormalizeAmenities(hotel?.amenities),
    [hotel],
  );

  return (
    <article className="hotelCard">
      <div
        className="hotelCardMedia"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          className="hotelCardImg"
          src={activeImage}
          alt={`${hotel.name} room ${activeImageIndex + 1}`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.net/600x600.png";
          }}
        />

        {hasMultipleImages && (
          <>
            <button
              type="button"
              className="hotelCarouselBtn hotelCarouselBtn--prev"
              onClick={showPreviousImage}
              aria-label={`Show previous ${hotel.name} room image`}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                chevron_left
              </span>
            </button>

            <button
              type="button"
              className="hotelCarouselBtn hotelCarouselBtn--next"
              onClick={showNextImage}
              aria-label={`Show next ${hotel.name} room image`}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                chevron_right
              </span>
            </button>

            <div className="hotelCarouselDots" aria-hidden="true">
              {carouselImages.map((image, index) => (
                <span
                  key={`${image}-${index}`}
                  className={`hotelCarouselDot ${
                    index === activeImageIndex ? "active" : ""
                  }`}
                />
              ))}
            </div>
          </>
        )}

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
          {amenityList.length > 0 ? (
            amenityList.map((amenity) => (
              <span
                key={amenity.id}
                className="material-symbols-outlined amenityIcon"
                title={amenity.name}
              >
                {getAmenityIcon(amenity.name)}
              </span>
            ))
          ) : (
            <span className="hotelMeta">No amenities listed</span>
          )}
        </div>

        <div className="hotelCardFooter">
          <p className="priceSuffix">
            As low as
            {hotel.price > 0 ? (
              <>
                <span className="price"> £{hotel.price} </span>
                <span className="priceSuffix">{hotel.priceSuffix}</span>
              </>
            ) : (
              <span className="priceSuffix">Price unavailable</span>
            )}
          </p>

          <button type="button" className="primaryBtn" onClick={handleViewDeal}>
            View Deal
          </button>
        </div>
      </div>
    </article>
  );
}

export default HotelCard;
