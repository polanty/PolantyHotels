// import { useEffect } from "react";
// import { useSearchParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   selectData,
//   selectAuthStatus,
//   selectAuthError,
// } from "../../store/auth/auth.selectors";
// import { paginatedHotels } from "../../store/auth/auth.thunks";

// export default function SearchResultsPage() {
//   const dispatch = useDispatch();
//   const [searchParams, setSearchParams] = useSearchParams();

//   const data = useSelector(selectData); // adjust slice key
//   const status = useSelector(selectAuthStatus);
//   const error = useSelector(selectAuthError);

//   console.log(data);

//   // pull params from URL
//   const cityRaw = searchParams.get("city") || undefined;
//   const countryRaw = searchParams.get("country") || undefined;

//   const city = cityRaw ? cityRaw.toLowerCase() : undefined;
//   const country = countryRaw ? countryRaw.toLowerCase() : undefined;

//   const page = Number(searchParams.get("page") || "1");

//   useEffect(() => {
//     const params = {
//       ...(city ? { city } : {}),
//       ...(country ? { country } : {}),
//       page,
//     };

//     dispatch(paginatedHotels(params));
//   }, [dispatch, city, country, page]);

//   const goToPage = (nextPage) => {
//     const next = new URLSearchParams(searchParams);
//     next.set("page", String(nextPage));
//     setSearchParams(next);
//   };

//   return (
//     <div>
//       <h1>Search Results</h1>

//       {status === "loading" && <p>Loading...</p>}
//       {status === "failed" && <p style={{ color: "crimson" }}>{error}</p>}

//       {status === "succeeded" && (
//         <>
//           <pre>{JSON.stringify(data, null, 2)}</pre>

//           <button disabled={page <= 1} onClick={() => goToPage(page - 1)}>
//             Prev
//           </button>
//           <button onClick={() => goToPage(page + 1)}>Next</button>
//         </>
//       )}
//     </div>
//   );
// }

// src/pages/HotelSearchResults.jsx
import { useMemo, useState } from "react";
import "./HotelSearchResults.css";

const seedHotels = [
  {
    id: "1",
    name: "The Modernist Hotel",
    rating: 4.7,
    locationText: "Midtown Manhattan, 0.5 miles from center",
    price: 349,
    priceSuffix: "/ night",
    amenities: ["wifi", "pool", "local_parking"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAD0B5aK8pw3KZDx5JFoTF7LJCnMfCc0gvYrZidYYp7JQZTyUFlioLYIKdL7raVdH6elLyT_oTYRqKDWEXL4YJ67IaJF6eeChkjCyokYnuiOs_CVnag3PtjXNbbtIotI6LqMTGSUA26d-X_ZXFjcXzWCqtUQFxL8Y8u6kLYA_PcQ_boV7bPi9mTe2ojq9gKog8EmvitnverchqFMyOhQ78j7gvso3Mhm5rwaF0N4alv-NqEhMHufEWAeCcH9IDOn5JSvFjr3DIMBPE",
    liked: false,
  },
  {
    id: "2",
    name: "The Urban Oasis",
    rating: 4.5,
    locationText: "Brooklyn, 2.1 miles from center",
    price: 280,
    priceSuffix: "/ night",
    amenities: ["wifi", "spa", "restaurant"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbjA-Cb5gJRq2ASQU2IPSMLNeET2Fxc8hVDH7ZTmg4uYIaXSC8eYfVkxF765sQr3gQaTZtGXPBlr_3gOZJmXi6lU9AwCfXVvLkBOKvU6W6XpgIdfRe17Khr-P0I4Q7wOUWiHTbCCtI1fOLQexNMTwnM3gBdnjZpDu8w0WL2X1AeQeF9a87suNLv0QBidIdAZrFfk2beHQzMS0OU2zCNj_rYvWCzP10_yPx7STYizXtJ1iNlyARgD28TFyoQHZYjOXtJwPri-BD-qA",
    liked: false,
  },
  {
    id: "3",
    name: "Grand Central Palace",
    rating: 4.9,
    locationText: "Near Grand Central, 0.2 miles from center",
    price: 450,
    priceSuffix: "/ night",
    amenities: ["wifi", "fitness_center", "pets"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrK5VOIkt0P3PyxWdM0mjN7mKEUnXG04_OtJsjkbl8EThwZvvXMJLNtAAWf3MfWDKfHg29gp_fLJV8UVDziUzPejbJywawCzuQcXpBSnou78qB-sl9IFyQzTJzLtG0m3LNmPe9rgpd_rVXXnosqTFLT_1cx-yMA6DabHvz54bvSPJZK3poZ2hoEmFqTxIlx6mNDlMDtWQOakBv3keNhOKMrCHoMZaeXuYYxOmYf1iDEfyh7AcGNV13Xpf9AieHUCbW3oR0shiKdrk",
    liked: true,
  },
  {
    id: "4",
    name: "Cityscape Inn",
    rating: 4.2,
    locationText: "Financial District, 1.5 miles from center",
    price: 210,
    priceSuffix: "/ night",
    amenities: ["wifi", "fitness_center"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_gZQjJ2WtuzwL7T3lsBmuScca8OQ3sWzEopDWhpsy7KwNd8vVHiaiuRJYKTElxQr8b83TxCPOuLpeUFKNFijIAvpqFjkSDcxQBNExc8a6B86IB46NMTCxRD0e9kT0dN5LI62L_cUGmuzHn8JW_lVchp2K1VQqiAUGeZ9u5TG2S_3s8yLkfcjpZsy7XEsv3Y7jHqMQDUMs9eYZwZT7Nf4jbV1rO_zh0aZJp8PmJVoTRH_uhzNvV4t4-tnuy-YDOwN3xTmy4khAzkI",
    liked: false,
  },
  {
    id: "5",
    name: "The Budget Stay",
    rating: 3.8,
    locationText: "Queens, 5.0 miles from center",
    price: 159,
    priceSuffix: "/ night",
    amenities: ["wifi", "local_parking"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDACKzpBnRO0R6xOSmUq7d2zvD0z30LHXwHlHlHUPCq9ER1Wdqby7ixxRxg59r3xP_f6iLkV87eua7iHEY1lFjq0QkgdHftYRMs-6AAtK124tvS57gNOsDvuThOW7lWpwPnZdoAEvDnMer_VhnxPJvNEq-GEjB504ydV94TFe1pBpKJy2X6O4wlKY3tWO_twq2G-og99xwYfzNUkn6hTFDAY2nq_hq9h8a3NSdU0UCrKhiHGh7XxD_oJZrJatrJ38WuQmilpkjT_io",
    liked: false,
  },
  {
    id: "6",
    name: "Riverside Luxury Suites",
    rating: 4.8,
    locationText: "Upper West Side, 2.8 miles from center",
    price: 520,
    priceSuffix: "/ night",
    amenities: ["wifi", "spa", "fitness_center"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDrCwfB_AgbfJPOiS-G8wgIiYm5rVyhQnF5PuQPhTM1Qm8j6yrdFi3Iy8zXB_TpO0JxQFUbVB5JeDbN2ckQwIrC_kWafLFEdJaXBu3hv5IVsUgvXXZlgaStynwhYCj1CYja-eXwCCHVkpt_j5jssG3xjbaaJhXTSBeOBtVK_P3ojcjdnFu0G3c_3gKaStHBuOuCFQMmf__Xe5VO1ajx_mbrlxyzd1x0s5A-5c66syfvmYMPrIKtvtmV5SLwa5vVrBIkPqUfIMfIyI4",
    liked: false,
  },
];

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

function HotelCard({ hotel, onToggleLike }) {
  return (
    <article className="hotelCard">
      <div className="hotelCardMedia">
        <img className="hotelCardImg" src={hotel.img} alt={hotel.name} />
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
            <span className="ratingNumber">{hotel.rating.toFixed(1)}</span>
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
            ${hotel.price}{" "}
            <span className="priceSuffix">{hotel.priceSuffix}</span>
          </p>
          <button type="button" className="primaryBtn">
            View Deal
          </button>
        </div>
      </div>
    </article>
  );
}

export default function HotelSearchResults() {
  const [searchValue, setSearchValue] = useState(
    "New York, NY | 2 Guests | Oct 26 - Oct 28",
  );

  const [price, setPrice] = useState(350);
  const [activeStars, setActiveStars] = useState(1);
  const [amenities, setAmenities] = useState({
    wifi: true,
    pool: false,
    local_parking: true,
    pets: true,
  });

  const [hotels, setHotels] = useState(seedHotels);
  const [sortBy, setSortBy] = useState("Popularity");
  const [page, setPage] = useState(1);

  const filteredHotels = useMemo(() => {
    let list = [...hotels];

    // Price filter (simple example: include hotels up to slider value)
    list = list.filter((h) => h.price <= price);

    // Star filter (simple example: keep those within +/- 1 of selected)
    if (activeStars) {
      list = list.filter((h) => Math.round(h.rating) >= activeStars);
    }

    // Amenities filter (if checked, require presence)
    const required = Object.entries(amenities)
      .filter(([, v]) => v)
      .map(([k]) => k);

    if (required.length) {
      list = list.filter((h) => required.some((r) => h.amenities.includes(r)));
    }

    // Sorting
    if (sortBy === "Price (Low to High)") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Rating (High to Low)") {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [hotels, price, activeStars, amenities, sortBy]);

  console.log(hotels);
  console.log(filteredHotels);

  const onToggleLike = (id) => {
    setHotels((prev) =>
      prev.map((h) => (h.id === id ? { ...h, liked: !h.liked } : h)),
    );
  };

  const onToggleAmenity = (key) => {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onApplyFilters = () => {
    // In your real app, you’ll update URL params + dispatch thunk here.
    // For now, filters already apply in-memory via useMemo.
  };

  const totalPages = 12;

  return (
    <div className="pageRoot dark">
      <div className="pageShell">
        {/* TopNavBar */}
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
            <label className="searchWrap" aria-label="Search">
              <span className="searchIcon material-symbols-outlined">
                search
              </span>
              <input
                className="searchInput"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="New York, NY | 2 Guests | Oct 26 - Oct 28"
              />
            </label>
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

            <div
              className="avatar"
              aria-label="User avatar"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBA7ynmCb7bUpPpEyE0XA8DRLGV4tAObYvOgXrF2zq0WFyqfwpxA46OTyhQF5jDkut7yH5PHXRzh72qnnyVFey_Ls_ar8xeKCj_4VJ9NnXlHTr_GGqESyVoThY-s93jXIs-w347zfxrAQZLuVtKO5zKQNPVhGfNeCYkBM1SPgXtElSTx5aGrBWe3kHAqGbVIqtSmnZMQy2s6bgSfpHw2uGZBFpsfop2Lwh7tMwDB8Db6lRs1uN_R2tQjAjJKUZ04njo2xiGUu0_Srs")',
              }}
            />
          </div>
        </header>

        <main className="layout">
          <div className="columns">
            {/* Filters */}
            <aside className="leftCol">
              <div className="sticky">
                <div
                  className="mapCard"
                  role="img"
                  aria-label="Map of New York City showing hotel locations"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDisueaJGCTYnd0SQEF96YUFb6nNZO0YDVGuEEiexlY04ngaa0bTwDOTD_kM6_BiSuqbB4sJoHXQ63CmE2jOhDJE9txhl8PSzEi78LGMLM0kitSDJ0bQAjxu07mMb9wAqJWYtE0Zs3wdQnyrXWEy9BjsOOvl61lhIGua323rnwrfBpwCV1DYS3eoPLQRLdknvGREmZJzg_Gm9Sowc-76lWgiusTWUzigd7FEctr3suYuX2sAz9KSXGrVsM79x0vYNAnpHAK5kapeog")',
                  }}
                />

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

                  {/* Stars */}
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
              <div className="breadcrumbs" aria-label="Breadcrumbs">
                <a href="#" className="crumb">
                  Home
                </a>
                <span className="crumbSep">/</span>
                <a href="#" className="crumb">
                  USA
                </a>
                <span className="crumbSep">/</span>
                <span className="crumbCurrent">New York</span>
              </div>

              <div className="headingRow">
                <div>
                  <p className="pageTitle">New York: 150+ hotels found</p>
                  <p className="pageSubtitle">
                    Showing results for 2 guests, from Oct 26 to Oct 28
                  </p>
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

              <div className="cardsGrid">
                {filteredHotels.map((h) => (
                  <HotelCard key={h.id} hotel={h} onToggleLike={onToggleLike} />
                ))}
              </div>

              <div className="paginationWrap" aria-label="Pagination">
                <nav className="pagination">
                  <button
                    type="button"
                    className="pageBtn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    <span className="material-symbols-outlined">
                      chevron_left
                    </span>
                  </button>

                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`pageNum ${page === n ? "active" : ""}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}

                  <span className="ellipsis">...</span>

                  <button
                    type="button"
                    className={`pageNum ${page === totalPages ? "active" : ""}`}
                    onClick={() => setPage(totalPages)}
                  >
                    {totalPages}
                  </button>

                  <button
                    type="button"
                    className="pageBtn"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Next page"
                  >
                    <span className="material-symbols-outlined">
                      chevron_right
                    </span>
                  </button>
                </nav>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
