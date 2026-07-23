import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { paginatedHotels } from "../../store/auth/auth.thunks";
import {
  paginatedHotelList,
  paginatedHotelsError,
  paginatedHotelsResults,
  paginatedHotelsStatus,
  paginatedHotelsTotalPages,
} from "../../store/auth/auth.selectors";
import { NormalizeAmenities } from "../../utils/utils";
// import { Spinner, NormalizeAmenities } from "../../utils/utils";
import SearchComponent from "../../Components/SearchBarComponent/SearchBarComponent";
import HotelCard from "../../Components/HotelCard/HotelCard";
import "./HotelSearchResults.css";

const AMENITY_FILTERS = [
  "WiFi",
  "Air Conditioning",
  "Flat Screen TV",
  "Minibar",
  "Coffee Maker",
  "Safe",
  "Hair Dryer",
  "Bathrobes",
  "Work Desk",
  "Balcony",
  "Smart TV",
  "Espresso Machine",
  "Restaurant",
  "Bar",
  "Gym",
  "Swimming Pool",
  "Spa",
  "Business Center",
  "Meeting Rooms",
  "Parking",
  "Room Service",
  "Concierge",
  "Airport Shuttle",
  "Laundry Service",
  "Pet Friendly",
  "Sauna",
];

function normalizeAmenityValue(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function HotelCardSkeleton() {
  return (
    <article className="hotelCard skeletonCard" aria-hidden="true">
      <div className="hotelCardMedia skeleton skeletonImage" />
      <div className="hotelCardBody">
        <div className="skeleton skeletonTitle" />
        <div className="skeleton skeletonText" />
        <div className="skeleton skeletonAmenities" />
        <div className="hotelCardFooter">
          <div className="skeleton skeletonPrice" />
          <div className="skeleton skeletonButton" />
        </div>
      </div>
    </article>
  );
}

function getImageUrl(image) {
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  if (typeof image === "string") {
    if (image.startsWith("/uploads/")) return `${apiBaseUrl}${image}`;
    return image;
  }

  if (image?.url) {
    if (image.url.startsWith("/uploads/")) return `${apiBaseUrl}${image.url}`;
    return image.url;
  }

  if (image?.secure_url) {
    if (image.secure_url.startsWith("/uploads/")) {
      return `${apiBaseUrl}${image.secure_url}`;
    }

    return image.secure_url;
  }

  return null;
}

function getRoomPreviewImages(roomRef) {
  if (!Array.isArray(roomRef)) return [];

  const imageUrls = roomRef
    .map((room) => {
      const roomImages = Array.isArray(room?.images) ? room.images : [];
      const roomTypeImages = Array.isArray(room?.room_type_id?.images)
        ? room.room_type_id.images
        : [];

      return getImageUrl([...roomImages, ...roomTypeImages][0]);
    })
    .filter(Boolean);

  return [...new Set(imageUrls)];
}

function mapHotelFromApi(item, likedHotelIds) {
  const id = item.id || item._id;
  const fallbackImage =
    item.image ||
    item.thumbnail ||
    item.photo ||
    "https://via.placeholder.com/600x400?text=Hotel+Image";
  const roomImages = getRoomPreviewImages(item.RoomRef || item.roomRef);
  const images = roomImages.length > 0 ? roomImages : [fallbackImage];
  return {
    id,
    name: item.name || "Unnamed Hotel",
    img: images[0],
    images,
    liked: likedHotelIds.includes(id),
    rating: Number(item.ratingsAverage ?? 0),
    locationText: [item.address, item.city, item.country]
      .filter(Boolean)
      .join(", "),
    amenities: NormalizeAmenities(item.amenities),
    price: Number(item.price ?? item.amount ?? 250),
    priceSuffix: "/night",
  };
}

export default function HotelSearchResults() {
  const dispatch = useDispatch();

  const rawHotels = useSelector(paginatedHotelList);
  const totalPages = useSelector(paginatedHotelsTotalPages);
  const results = useSelector(paginatedHotelsResults);
  const loading = useSelector(paginatedHotelsStatus) === "loading";
  const error = useSelector(paginatedHotelsError);

  const [searchParams, setSearchParams] = useSearchParams();

  const city = searchParams.get("city") || "";
  const pageFromUrl = Number(searchParams.get("page") || 1);
  const currentPage =
    Number.isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;

  const [price, setPrice] = useState(350);
  const [activeStars, setActiveStars] = useState(0);
  const [amenities, setAmenities] = useState(() =>
    AMENITY_FILTERS.reduce(
      (selectedAmenities, amenity) => ({
        ...selectedAmenities,
        [amenity]: false,
      }),
      {},
    ),
  );
  const [sortBy, setSortBy] = useState("Popularity");
  const [likedHotelIds, setLikedHotelIds] = useState([]);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  useEffect(() => {
    if (!city) return;

    const request = dispatch(
      paginatedHotels({
        city,
        page: currentPage,
      }),
    );

    return () => {
      request.abort();
    };
  }, [dispatch, city, currentPage]);

  const hotels = useMemo(() => {
    return rawHotels.map((hotel) => mapHotelFromApi(hotel, likedHotelIds));
  }, [rawHotels, likedHotelIds]);

  const filteredHotels = useMemo(() => {
    let list = [...hotels];

    list = list.filter((hotel) => hotel.price <= price);

    if (activeStars > 0) {
      list = list.filter((hotel) => Math.round(hotel.rating) >= activeStars);
    }

    const requiredAmenities = Object.entries(amenities)
      .filter(([, value]) => value)
      .map(([key]) => normalizeAmenityValue(key));

    if (requiredAmenities.length > 0) {
      list = list.filter((hotel) => {
        const hotelAmenities = hotel.amenities.flatMap((amenity) => [
          normalizeAmenityValue(amenity.name),
          normalizeAmenityValue(amenity.category),
          normalizeAmenityValue(amenity.description),
        ]);

        return requiredAmenities.every((required) =>
          hotelAmenities.includes(required),
        );
      });
    }

    if (sortBy === "Price (Low to High)") {
      list.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "Rating (High to Low)") {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [hotels, price, activeStars, amenities, sortBy]);

  const onToggleLike = (id) => {
    setLikedHotelIds((prev) =>
      prev.includes(id)
        ? prev.filter((hotelId) => hotelId !== id)
        : [...prev, id],
    );
  };

  const onToggleAmenity = (key) => {
    setAmenities((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const goToPage = (nextPage) => {
    if (!city) return;

    setSearchParams({
      city,
      page: String(nextPage),
    });
  };

  const onApplyFilters = () => {
    // Filters are already applied live through useMemo.
  };

  return (
    <div className="pageRoot">
      <SearchComponent />

      <div className="pageShell">
        <main className="layout">
          <div className="columns">
            <aside className="leftCol">
              <button
                type="button"
                className="filterToggle"
                aria-expanded={filtersExpanded}
                aria-controls="search-filter-panel"
                onClick={() => setFiltersExpanded((expanded) => !expanded)}
              >
                <span>Filter By</span>
                <span className="filterToggleHint">
                  {filtersExpanded ? "Collapse" : "Expand below"}
                </span>
                <span
                  className={`material-symbols-outlined filterToggleIcon ${
                    filtersExpanded ? "open" : ""
                  }`}
                  aria-hidden="true"
                >
                  keyboard_arrow_down
                </span>
              </button>

              <div
                id="search-filter-panel"
                className={`sticky filterPanel ${
                  filtersExpanded ? "filterPanel--open" : ""
                }`}
              >
                <section className="filterCard" aria-label="Filter by">
                  <h2 className="filterTitle">Filter By</h2>

                  <div className="filterSection">
                    <label className="filterLabel" htmlFor="price-range">
                      Price Range
                    </label>

                    <input
                      id="price-range"
                      className="range"
                      type="range"
                      min="50"
                      max="1000"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                    />

                    <div className="rangeLabels">
                      <span>$50</span>
                      <span>$1000+</span>
                    </div>
                  </div>

                  <div className="filterSection">
                    <h3 className="filterLabel">Star Rating</h3>

                    <div
                      className="starRow"
                      role="group"
                      aria-label="Star rating"
                    >
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={`starBtn ${activeStars === n ? "active" : ""}`}
                          onClick={() => setActiveStars(n)}
                        >
                          {n === 0 ? "All" : n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="filterSection noBorder">
                    <h3 className="filterLabel">Amenities</h3>

                    <div className="amenityChecks">
                      {AMENITY_FILTERS.map((amenity) => (
                        <label className="checkRow" key={amenity}>
                          <input
                            type="checkbox"
                            checked={Boolean(amenities[amenity])}
                            onChange={() => onToggleAmenity(amenity)}
                          />
                          <span>{amenity}</span>
                        </label>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="primaryBtn wFull"
                      onClick={onApplyFilters}
                    >
                      Apply Filters
                    </button>
                  </div>
                </section>
              </div>
            </aside>

            <section className="rightCol">
              <div className="headingRow">
                <div>
                  <p className="pageTitle">
                    {city
                      ? `${city}: ${results || filteredHotels.length} hotels found`
                      : "Hotels"}
                  </p>
                  <p className="pageSubtitle">Page {currentPage}</p>
                </div>

                <div className="sortRow">
                  <span className="sortLabel">Sort by:</span>

                  <select
                    className="select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option>Popularity</option>
                    <option>Price (Low to High)</option>
                    <option>Rating (High to Low)</option>
                  </select>
                </div>
              </div>

              {!city && (
                <div className="emptyState emptyState--search">
                  <div className="emptyStateIcon" aria-hidden="true">
                    <span className="material-symbols-outlined">
                      travel_explore
                    </span>
                  </div>
                  <p className="emptyStateEyebrow">Your next stay awaits</p>
                  <h2 className="emptyStateTitle">
                    Where would you like to go?
                  </h2>
                  <p className="emptyStateMessage">
                    Search for a city above to discover hand-picked hotels,
                    compare rooms, and find the perfect place to stay.
                  </p>
                </div>
              )}

              {city && loading && (
                <>
                  {/* <Spinner /> */}{" "}
                  {/* You can replace this with any loading indicator you prefer */}
                  <div className="cardsGrid">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <HotelCardSkeleton key={index} />
                    ))}
                  </div>
                </>
              )}

              {city && !loading && error && (
                <div className="errorState" role="alert">
                  <p>{error}</p>
                </div>
              )}

              {city && !loading && !error && filteredHotels.length === 0 && (
                <div className="emptyState">
                  <p>No hotels found for this search.</p>
                </div>
              )}

              {city && !loading && !error && filteredHotels.length > 0 && (
                <>
                  <div className="cardsGrid">
                    {filteredHotels.map((hotel) => (
                      <HotelCard
                        key={hotel.id}
                        hotel={hotel}
                        onToggleLike={onToggleLike}
                      />
                    ))}
                  </div>

                  <div className="paginationWrap" aria-label="Pagination">
                    <nav className="pagination">
                      <button
                        type="button"
                        className="pageBtn"
                        onClick={() => goToPage(Math.max(1, currentPage - 1))}
                        aria-label="Previous page"
                        disabled={currentPage === 1}
                      >
                        <span className="material-symbols-outlined">
                          chevron_left
                        </span>
                      </button>

                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => i + 1,
                      ).map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={`pageNum ${currentPage === n ? "active" : ""}`}
                          onClick={() => goToPage(n)}
                        >
                          {n}
                        </button>
                      ))}

                      <button
                        type="button"
                        className="pageBtn"
                        onClick={() =>
                          goToPage(Math.min(totalPages, currentPage + 1))
                        }
                        aria-label="Next page"
                        disabled={currentPage === totalPages}
                      >
                        <span className="material-symbols-outlined">
                          chevron_right
                        </span>
                      </button>
                    </nav>
                  </div>
                </>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
