import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const DESTINATION_BG =
  'linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDt8MEL-c-9eNtjj4KkKjZm3lOuwhUg9NYppUFuKVQsfCpLZlyDQpRQ2PqpFhuDW4sW8gkCVr5ZmaNez-FUECTWoHLT72mEgGwX83dmUsdsCeeYt2w2nInXv6s1b-bX5PHdlWr2GI97ZPkMsxmJkxRRlF1B3g0fmFIei8ISXMhYKASZ07LZ9ijOr5e3lYcVsLmA4qHF210pOCjuk1CfNA58BqSWWaQjVSnjykk0qk3z9XrMx0AyyPTmZXMqFH-k-o4yi4J-HE6--x4")';

const featured = [
  {
    city: "Paris",
    price: "Starting from $120",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAN7Dc-us3a-HdKwbFeSUOR-pqJFDUApka5hTYeL1bP_uTrMgjecyd0xZGyniCquHqTer1sv1mqUsyQHuBNhTzN7Snt69bw6UqKKdlxvaeQ005DeGK8PXq6OV6b6RzNDx7bSucyk-c2rvbUTSu78Hu2PR3Pe0CiF37su0AQ8X_LmHWAE3GKBPo_vupuzLMMqdkAfOPIerQmwRoLJASNpWPPP2HB2_ZOSoc585HwjlaQvsJc6WbnGWhV1qf0AjyVSb2CO3miFG3o7CU",
    alt: "A beautiful street view of Paris with classic architecture.",
  },
  {
    city: "Tokyo",
    price: "Starting from $95",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAI9blD2U4ItYZ22ryPvgx2cn7g65Y481zqr6CvQ9ez5MyYauG95wn3EP1luqJr-F41Jx62Z9QbrhmvNutZYyNS2H2dq02pnjhNw6tjjW-wZzPzgHe6iFpFDeClZqCE1cdr3tB_YNg7LDLpLsdfdXC8mHhK_GyQWDWN6VyhQGkikpLsrpd1JLj8eP7Wsmwjxr18zQQRVgQkaUWBNtADiwhUgkmwFsbUTJGQo5tVqq3FxXF8i-1dztlSqGeBZ39bPFR03Ewx73YjhPA",
    alt: "A vibrant, neon-lit street in Tokyo at night.",
  },
  {
    city: "New York",
    price: "Starting from $150",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMOSNeaKNMufeMcc7ODDxvR9G_p3Je3JJ4KfyFAw-6CEFFqj861wQ2cSt9ZWth2YQzJovBFQRKlE2lZf_NOu0BdBdF8aFDRV42C0uLANrAWfxd-bSy8SJ1_UllvqRamFZkOUDqNUzbw9RcNWE-Cqi9cN5SpvVYM0O4N6AKxdxlsVE1eTBSHDhXlp6X2cyYKbiYSpMyFzbfqtz3k9sqbpjHEwZikxqu1v4utd1U5k2dI7cKACDfjwTidGtzb7lvs1ANli79GBIbZGE",
    alt: "The iconic skyline of New York City at dusk.",
  },
  {
    city: "Rome",
    price: "Starting from $110",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6SLa5Rz1oGmPwVHXfnGSJZ9slowCWLfaFP_qpFRj-SCT-Z87hWbWdXqdM_XBBCFY8w5umcYFKpEWFE8mfR6u75hYXtKkuPH3K1fe_45O3vsRDZCX5fHWRp1YEbesNeIkKYE4I-st_3MGpLZpz9lkxgQApa3BcqxCoObuZEN6O2TtxBLndegOhs2Hwis7eWNri51ZyDtVzXBapjD-wHADkLnnVu22E7ppsDQvMk_0Kpm4t8-Y9ltd51vTOrmUaWVOYSjj11vk_DAY",
    alt: "The ancient Colosseum in Rome under a sunny sky.",
  },
];

function Index() {
  // const dispatch = useDispatch();
  // const isAuthed = useSelector(selectIsAuthed);
  // const userData = useSelector(selectUser);
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [destinationError, setDestinationError] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [email, setEmail] = useState("");

  // useEffect(() => {
  //   dispatch(fetchMe());
  // }, [dispatch]);

  // Note: Your original HTML uses <html class="dark">.
  // To keep dark mode, add class="dark" on <html> in public/index.html (or toggle it yourself).

  const heroStyle = useMemo(() => ({ backgroundImage: DESTINATION_BG }), []);

  // small example country list (expand or use a proper dataset/API)
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

      // Auto-remove error after 3 seconds
      setTimeout(() => {
        setDestinationError(false);
      }, 3000);

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

  function onSubscribe(e) {
    e.preventDefault();
    console.log({ email });
  }

  return (
    <div className="page">
      <main>
        {/* Hero Section */}
        <section className="hero" style={heroStyle} aria-label="Hero">
          <div className="container hero__content">
            <div className="hero__text">
              <h1 className="hero__title">Find Your Next Unforgettable Stay</h1>
              <p className="hero__subtitle">
                Discover and book unique accommodations anywhere in the world.
              </p>
            </div>
          </div>

          {/* Hotel Search Bar */}
          <div className="heroSearch" aria-label="Hotel search bar">
            <div className="container heroSearch__container">
              <form className="searchCard" onSubmit={onSearch}>
                <div className="searchRow">
                  <div className="searchCell searchCell--location">
                    <label className="fieldRow">
                      <span
                        className="material-symbols-outlined fieldRow__icon"
                        aria-hidden="true"
                      >
                        location_on
                      </span>

                      <input
                        className={`input input--ghost ${destinationError ? "input-error" : ""}`}
                        placeholder="Destination, city, hotel"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                      />
                    </label>

                    {destinationError && (
                      <p className="error-text">
                        A destination must be provided.
                      </p>
                    )}
                  </div>

                  <div className="searchCell">
                    <label className="fieldRow">
                      <span
                        className="material-symbols-outlined fieldRow__icon"
                        aria-hidden="true"
                      >
                        calendar_month
                      </span>
                      <input
                        className="input input--ghost"
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        aria-label="Check-in date"
                      />
                    </label>
                  </div>

                  <div className="searchCell">
                    <label className="fieldRow">
                      <span
                        className="material-symbols-outlined fieldRow__icon"
                        aria-hidden="true"
                      >
                        calendar_month
                      </span>
                      <input
                        className="input input--ghost"
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        aria-label="Check-out date"
                      />
                    </label>
                  </div>

                  <div className="searchCell">
                    <label className="fieldRow">
                      <span
                        className="material-symbols-outlined fieldRow__icon"
                        aria-hidden="true"
                      >
                        group
                      </span>
                      <select
                        className="select select--ghost"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        aria-label="Guests"
                      >
                        <option>2 guests</option>
                        <option>1 guest</option>
                        <option>3 guests</option>
                        <option>4 guests</option>
                      </select>
                    </label>
                  </div>

                  <div className="searchCell searchCell--cta">
                    <button
                      className="btn btn--primary btn--search"
                      type="submit"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="section section--spacious">
          <div className="container">
            <div className="valueGrid">
              <div className="valueCard">
                <div className="valueCard__icon">
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    hotel_class
                  </span>
                </div>
                <h3 className="valueCard__title">Vast Selection</h3>
                <p className="valueCard__text">
                  Choose from millions of hotels and homes in over 190
                  countries.
                </p>
              </div>

              <div className="valueCard">
                <div className="valueCard__icon">
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    verified_user
                  </span>
                </div>
                <h3 className="valueCard__title">Best Price Guarantee</h3>
                <p className="valueCard__text">
                  Find the lowest price for your stay, we promise. No hidden
                  fees.
                </p>
              </div>

              <div className="valueCard">
                <div className="valueCard__icon">
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    support_agent
                  </span>
                </div>
                <h3 className="valueCard__title">24/7 Support</h3>
                <p className="valueCard__text">
                  Our team is here to help you around the clock, whenever you
                  need us.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Destinations Section */}
        <section className="section section--alt">
          <div className="container">
            <div className="sectionHead">
              <h2 className="sectionHead__title">Featured Destinations</h2>
              <p className="sectionHead__subtitle">
                Explore top cities and start planning your next adventure.
              </p>
            </div>

            <div className="featuredGrid">
              {featured.map((item) => (
                <article key={item.city} className="featuredCard">
                  <img
                    className="featuredCard__img"
                    src={item.img}
                    alt={item.alt}
                  />
                  <div className="featuredCard__overlay" aria-hidden="true" />
                  <div className="featuredCard__content">
                    <h3 className="featuredCard__title">{item.city}</h3>
                    <p className="featuredCard__price">{item.price}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="section">
          <div className="container">
            <div className="ctaCard">
              <h2 className="ctaCard__title">
                Join Our Community for Exclusive Deals
              </h2>
              <p className="ctaCard__text">
                Sign up for our newsletter to receive the latest travel news,
                inspirational stories, and special offers delivered straight to
                your inbox.
              </p>

              <form className="ctaForm" onSubmit={onSubscribe}>
                <label className="ctaForm__field">
                  <input
                    className="input input--solid"
                    placeholder="Enter your email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
                <button className="btn btn--secondary" type="submit">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Index;
