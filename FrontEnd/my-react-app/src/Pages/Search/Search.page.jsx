import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchComponent from "../../Components/SearchBarComponent/SearchBarComponent";
import HotelCard from "../../Components/HotelCard/HotelCard";
import "./HotelSearchResults.css";

/**
 * Spinner shown while data is loading
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
 * Safely normalize amenities from API response.
 * Your API may return strings or objects like:
 * { category, name, description }
 */
function normalizeAmenities(amenities) {
  if (!Array.isArray(amenities)) return [];

  return amenities
    .map((amenity) => {
      if (typeof amenity === "string") return amenity;

      if (typeof amenity === "object" && amenity !== null) {
        return amenity.name || amenity.category || amenity.description || "";
      }

      return "";
    })
    .filter(Boolean);
}

/**
 * Map API hotel response into the structure your UI expects
 */
function mapHotelFromApi(item) {
  return {
    id: item.id || item._id,
    name: item.name || "Unnamed Hotel",

    // Replace with real image field from backend when available
    img:
      item.image ||
      item.thumbnail ||
      item.photo ||
      "https://via.placeholder.com/600x400?text=Hotel+Image",

    liked: false,
    rating: Number(item.ratingsAverage ?? 0),
    locationText: [item.address, item.city, item.country]
      .filter(Boolean)
      .join(", "),
    amenities: normalizeAmenities(item.amenities),

    // Replace with real price fields when backend provides them
    price: Number(item.price ?? item.amount ?? 250),
    priceSuffix: "/night",
  };
}

export default function HotelSearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();

  /**
   * Read params from the URL
   * Example:
   * /search?city=manchester&page=1
   */
  const city = searchParams.get("city") || "";
  const currentPage = Number(searchParams.get("page") || 1);

  const [searchValue, setSearchValue] = useState("");
  const [price, setPrice] = useState(350);
  const [activeStars, setActiveStars] = useState(0);
  const [amenities, setAmenities] = useState({
    wifi: false,
    pool: false,
    local_parking: false,
    pets: false,
  });
  const [sortBy, setSortBy] = useState("Popularity");

  // API state
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  /**
   * Keep search input in sync with city param
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

        /**
         * Your API shape:
         * data.data.data.allHotels
         */
        const apiHotels = Array.isArray(data?.data?.data?.allHotels)
          ? data.data.data.allHotels
          : [];

        const mappedHotels = apiHotels.map(mapHotelFromApi);

        setHotels(mappedHotels);
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

  /**
   * Filter and sort the hotels in memory
   */
  const filteredHotels = useMemo(() => {
    let list = [...hotels];

    // Filter by max price
    list = list.filter((hotel) => hotel.price <= price);

    // Filter by minimum star rating
    if (activeStars > 0) {
      list = list.filter((hotel) => Math.round(hotel.rating) >= activeStars);
    }

    // Filter by selected amenities
    const requiredAmenities = Object.entries(amenities)
      .filter(([, value]) => value)
      .map(([key]) => key.toLowerCase());

    if (requiredAmenities.length > 0) {
      list = list.filter((hotel) => {
        const hotelAmenities = hotel.amenities.map((amenity) =>
          String(amenity).toLowerCase().trim(),
        );

        return requiredAmenities.some((required) => {
          if (required === "local_parking") {
            return (
              hotelAmenities.includes("local_parking") ||
              hotelAmenities.includes("parking")
            );
          }

          return hotelAmenities.includes(required);
        });
      });
    }

    // Sort results
    if (sortBy === "Price (Low to High)") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Rating (High to Low)") {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [hotels, price, activeStars, amenities, sortBy]);

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
   * Toggle amenity filter
   */
  const onToggleAmenity = (key) => {
    setAmenities((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  /**
   * Submit search and update URL
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
   * Pagination handler
   */
  const goToPage = (nextPage) => {
    setSearchParams({
      city,
      page: String(nextPage),
    });
  };

  /**
   * Currently filters are live, so this button is optional
   */
  const onApplyFilters = () => {
    // Filters already apply automatically through useMemo.
    // Kept here because your current UI includes the button.
  };

  return (
    <div className="pageRoot dark">
      <div className="index-search--holder">
        <SearchComponent />
      </div>
      <div className="pageShell">
        {/* Top navbar */}
        {/* <header className="topNav">
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
        </header> */}

        <main className="layout">
          <div className="columns">
            {/* Filters */}
            <aside className="leftCol">
              <div className="sticky">
                <section className="filterCard" aria-label="Filter by">
                  <h2 className="filterTitle">Filter By</h2>

                  {/* Price */}
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

                  {/* Star rating */}
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

                  {/* Amenities */}
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

            {/* Results */}
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

              {/* Loading state */}
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

              {/* Error state */}
              {!loading && error && (
                <div className="errorState" role="alert">
                  <p>{error}</p>
                </div>
              )}

              {/* Empty state */}
              {!loading && !error && filteredHotels.length === 0 && (
                <div className="emptyState">
                  <p>No hotels found for this search.</p>
                </div>
              )}

              {/* Success state */}
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
