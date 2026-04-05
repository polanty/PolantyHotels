import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./HotelSearchResults.css";

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
            e.currentTarget.src =
              "https://via.placeholder.com/600x400?text=No+Image";
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
          {hotel.amenities.map((a) => (
            <span
              key={a}
              className="material-symbols-outlined amenityIcon"
              title={a}
            >
              {a}
            </span>
          ))}
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

/**
 * Skeleton placeholder card shown while loading
 */
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

/**
 * Spinner
 */
function Spinner() {
  return (
    <div className="spinnerWrap" role="status" aria-live="polite">
      <div className="spinner" />
      <p>Loading hotels...</p>
    </div>
  );
}

/**
 * Map your backend hotel response into the UI shape your card expects.
 * Adjust these fields to match your real API response.
 */
function mapHotelFromApi(item) {
  return {
    id: item.id || item._id,
    name: item.name || "Unnamed Hotel",
    img: "https://via.placeholder.com/600x400?text=Hotel+Image",
    liked: false,
    rating: Number(item.ratingsAverage ?? 0),
    locationText: [item.address, item.city, item.country]
      .filter(Boolean)
      .join(", "),
    amenities: Array.isArray(item.amenities) ? item.amenities : [],
    price: 250,
    priceSuffix: "/night",
  };
}

export default function HotelSearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();

  /**
   * Read params from the URL.
   * Example URL:
   * /search?city=manchester&page=1
   */
  const city = searchParams.get("city") || "";
  const currentPage = Number(searchParams.get("page") || 1);

  const [searchValue, setSearchValue] = useState("");
  const [price, setPrice] = useState(350);
  const [activeStars, setActiveStars] = useState(1);
  const [amenities, setAmenities] = useState({
    wifi: true,
    pool: false,
    local_parking: true,
    pets: true,
  });
  const [sortBy, setSortBy] = useState("Popularity");

  // API states
  // const [hotels, setHotels] = useState([]);
  const [filteredHotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  /**
   * Keep the search input synced with the city from the URL
   */
  useEffect(() => {
    setSearchValue(city);
  }, [city]);

  /**
   * Fetch hotels whenever city or page changes
   */
  useEffect(() => {
    if (!city) {
      setHotels([]);
      setError("No city was provided in the search URL.");
      return;
    }

    let ignore = false;
    const controller = new AbortController();

    async function fetchHotels() {
      try {
        setLoading(true);
        setError("");

        const endpoint = `http://127.0.0.1:3000/api/v1/hotels?city=${encodeURIComponent(
          city,
        )}&page=${currentPage}`;

        const response = await fetch(endpoint, {
          method: "GET",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (ignore) return;

        // Your real hotel list lives here
        const apiHotels = Array.isArray(data?.data?.data?.allHotels)
          ? data.data.data.allHotels
          : [];

        setHotels(apiHotels.map(mapHotelFromApi));

        // Pagination from your backend
        setTotalPages(Number(data?.totalPages ?? 1));
      } catch (err) {
        if (err.name === "AbortError") return;

        if (!ignore) {
          setHotels([]);
          setError(
            err.message || "Something went wrong while fetching hotels.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchHotels();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [city, currentPage]);

  console.log(filteredHotels);

  /**
   *
   * Filter and sort the hotels from API in-memory
   */
  // const filteredHotels = useMemo(() => {
  //   let list = [...hotels];

  //   // price filter
  //   list = list.filter((h) => h.price <= price);

  //   // star filter
  //   if (activeStars) {
  //     list = list.filter((h) => Math.round(h.rating) >= activeStars);
  //   }

  //   // amenities filter
  //   const required = Object.entries(amenities)
  //     .filter(([, value]) => value)
  //     .map(([key]) => key);

  //   if (required.length) {
  //     list = list.filter((h) =>
  //       required.some((requiredAmenity) =>
  //         h.amenities
  //           .map((a) => String(a).toLowerCase().trim())
  //           .includes(requiredAmenity.toLowerCase()),
  //       ),
  //     );
  //   }

  //   // sorting
  //   if (sortBy === "Price (Low to High)") {
  //     list.sort((a, b) => a.price - b.price);
  //   } else if (sortBy === "Rating (High to Low)") {
  //     list.sort((a, b) => b.rating - a.rating);
  //   }

  //   return list;
  // }, [hotels, price, activeStars, amenities, sortBy]);

  /**
   * Toggle favourite locally
   */
  const onToggleLike = (id) => {
    setHotels((prev) =>
      prev.map((hotel) =>
        hotel.id === id ? { ...hotel, liked: !hotel.liked } : hotel,
      ),
    );
  };

  /**
   * Toggle amenity locally
   */
  const onToggleAmenity = (key) => {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /**
   * Optional search submit from input
   * This updates URL, which triggers the fetch automatically
   */
  const onSearchSubmit = (e) => {
    e.preventDefault();

    const trimmed = searchValue.trim();
    if (!trimmed) return;

    setSearchParams({
      city: trimmed.toLowerCase(),
      page: "1",
    });
  };

  /**
   * Pagination handler, update URL
   */
  const goToPage = (nextPage) => {
    setSearchParams({
      city,
      page: String(nextPage),
    });
  };

  const onApplyFilters = () => {
    // For now filters are applied client-side through useMemo.
    // Later you can also push filter params into the URL here if you want.
  };

  return (
    <div className="pageRoot dark">
      <div className="pageShell">
        <header className="topNav">
          <div className="brandRow">
            <div className="brandMark" aria-hidden="true">
              <span className="material-symbols-outlined kingBed">
                king_bed
              </span>
            </div>
            <h2 className="brandName">StayScout</h2>
          </div>

          <div className="navSearch">
            <form onSubmit={onSearchSubmit}>
              <label className="searchWrap" aria-label="Search">
                <span className="searchIcon material-symbols-outlined">
                  search
                </span>
                <input
                  className="searchInput"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search city"
                />
              </label>
            </form>
          </div>

          <div className="navActions">
            <nav className="navLinks" aria-label="Primary">
              <a href="#" className="navLink">
                Stays
              </a>
              <a href="#" className="navLink">
                Flights
              </a>
              <a href="#" className="navLink">
                Car Rentals
              </a>
            </nav>

            <button className="ghostBtn" type="button">
              Log In
            </button>
            <button className="primaryBtn" type="button">
              Sign Up
            </button>
          </div>
        </header>

        <main className="layout">
          <div className="columns">
            <aside className="leftCol">
              <div className="sticky">
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
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={`starBtn ${activeStars === n ? "active" : ""}`}
                          onClick={() => setActiveStars(n)}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="filterSection noBorder">
                    <h3 className="filterLabel">Amenities</h3>

                    <div className="amenityChecks">
                      <label className="checkRow">
                        <input
                          type="checkbox"
                          checked={amenities.wifi}
                          onChange={() => onToggleAmenity("wifi")}
                        />
                        <span>Free Wi-Fi</span>
                      </label>

                      <label className="checkRow">
                        <input
                          type="checkbox"
                          checked={amenities.pool}
                          onChange={() => onToggleAmenity("pool")}
                        />
                        <span>Swimming Pool</span>
                      </label>

                      <label className="checkRow">
                        <input
                          type="checkbox"
                          checked={amenities.local_parking}
                          onChange={() => onToggleAmenity("local_parking")}
                        />
                        <span>Parking</span>
                      </label>

                      <label className="checkRow">
                        <input
                          type="checkbox"
                          checked={amenities.pets}
                          onChange={() => onToggleAmenity("pets")}
                        />
                        <span>Pet Friendly</span>
                      </label>
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
                      ? `${city}: ${filteredHotels.length} hotels found`
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

              {loading && (
                <>
                  <Spinner />
                  <div className="cardsGrid">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <HotelCardSkeleton key={index} />
                    ))}
                  </div>
                </>
              )}

              {!loading && error && (
                <div className="errorState" role="alert">
                  <p>{error}</p>
                </div>
              )}

              {!loading && !error && filteredHotels.length === 0 && (
                <div className="emptyState">
                  <p>No hotels found for this search.</p>
                </div>
              )}

              {!loading && !error && filteredHotels.length > 0 && (
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
