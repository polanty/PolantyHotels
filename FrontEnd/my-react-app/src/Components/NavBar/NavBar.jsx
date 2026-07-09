import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectIsAuthed, selectUser } from "../../store/auth/auth.selectors";
import { logoutThunk } from "../../store/auth/auth.thunks";

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
).replace(/\/$/, "");

const fallbackProfileImages = new Set(["profile.jpeg", "default.jpg"]);

function resolveProfileImage(userData) {
  const image = userData?.profile_image || userData?.user?.profile_image;

  if (!image || fallbackProfileImages.has(image)) return "";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  if (image.startsWith("/uploads/")) return `${apiBaseUrl}${image}`;

  return `${apiBaseUrl}/uploads/${image}`;
}

export default function Navbar() {
  const dispatch = useDispatch();
  const isAuthed = useSelector(selectIsAuthed);
  const userData = useSelector(selectUser);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileImageFailed, setProfileImageFailed] = useState(false);
  const profileMenuRef = useRef(null);

  const firstName =
    userData?.user?.first_name || userData?.first_name || userData?.name || "";
  const profileImageUrl = resolveProfileImage(userData);
  const showProfileImage =
    isAuthed && profileImageUrl && !profileImageFailed;

  const closeMenu = () => setIsMenuOpen(false);
  const closeProfileMenu = () => setIsProfileMenuOpen(false);

  const handleLogout = () => {
    dispatch(logoutThunk());
    closeMenu();
    closeProfileMenu();
  };

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 769px)");

    const closeOnDesktop = (event) => {
      if (event.matches) {
        closeMenu();
      } else {
        closeProfileMenu();
      }
    };

    closeOnDesktop(desktopQuery);
    desktopQuery.addEventListener("change", closeOnDesktop);

    return () => desktopQuery.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!isProfileMenuOpen) return undefined;

    const handleProfileMenuDismiss = (event) => {
      if (event.key === "Escape") {
        closeProfileMenu();
        return;
      }

      if (
        event.type === "mousedown" &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        closeProfileMenu();
      }
    };

    window.addEventListener("keydown", handleProfileMenuDismiss);
    window.addEventListener("mousedown", handleProfileMenuDismiss);

    return () => {
      window.removeEventListener("keydown", handleProfileMenuDismiss);
      window.removeEventListener("mousedown", handleProfileMenuDismiss);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    setProfileImageFailed(false);
  }, [profileImageUrl]);

  return (
    <header className="topbar" role="banner">
      <nav className="container topbar__inner" aria-label="Top navigation">
        <div className="brand brand--footer">
          <Link to="/" className="brand__link">
            <span
              className="material-symbols-outlined brand__icon"
              aria-hidden="true"
            >
              travel_explore
            </span>
            <h2 className="brand__name">Voyage</h2>
          </Link>
        </div>

        <div className="navlinks" aria-label="Primary links">
          <Link className="navlinks__link" to="/destinations">
            Destinations
          </Link>
          <Link className="navlinks__link" to="/deals">
            Deals
          </Link>
          <Link className="navlinks__link" to="/support">
            Support
          </Link>
        </div>

        <div className="topbar__actions">
          {isAuthed && firstName && (
            <div className="profileMenu" ref={profileMenuRef}>
              <button
                type="button"
                className="profileMenu__trigger"
                aria-expanded={isProfileMenuOpen}
                aria-controls="desktop-profile-menu"
                onClick={() => setIsProfileMenuOpen((open) => !open)}
              >
                <span className="profileMenu__avatar" aria-hidden="true">
                  {showProfileImage ? (
                    <img
                      src={profileImageUrl}
                      alt=""
                      className="profileMenu__avatarImage"
                      onError={() => setProfileImageFailed(true)}
                    />
                  ) : (
                    <span className="material-symbols-outlined">person</span>
                  )}
                </span>
                <span className="user-greeting">Welcome {firstName}</span>
                <span
                  className={`material-symbols-outlined profileMenu__chevron ${
                    isProfileMenuOpen ? "open" : ""
                  }`}
                  aria-hidden="true"
                >
                  keyboard_arrow_down
                </span>
              </button>

              <div
                id="desktop-profile-menu"
                className={`profileMenu__dropdown ${
                  isProfileMenuOpen ? "profileMenu__dropdown--open" : ""
                }`}
              >
                <Link to="/profile" onClick={closeProfileMenu}>
                  Profile
                </Link>
                <Link to="/reviews" onClick={closeProfileMenu}>
                  Reviews
                </Link>
                <Link to="/bookings" onClick={closeProfileMenu}>
                  Bookings
                </Link>
                <Link to="/settings" onClick={closeProfileMenu}>
                  Settings
                </Link>
                <button type="button" onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {!isAuthed && (
            <Link to="/auth" className="btn btn--muted topbarAuthBtn" type="button">
              Sign In
            </Link>
          )}

          {!isAuthed && (
            <Link to="/auth" className="btn btn--primary topbarAuthBtn" type="button">
              Sign Up
            </Link>
          )}

          <button
            className="menuToggle"
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-account-menu"
            onClick={() => setIsMenuOpen(true)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              menu
            </span>
          </button>
        </div>
      </nav>

      <div
        className={`menuOverlay ${isMenuOpen ? "menuOverlay--open" : ""}`}
        onMouseDown={closeMenu}
        aria-hidden={!isMenuOpen}
      />

      <aside
        id="mobile-account-menu"
        className={`navDrawer ${isMenuOpen ? "navDrawer--open" : ""}`}
        aria-label="Account navigation"
        aria-hidden={!isMenuOpen}
      >
        <div className="navDrawer__header">
          <div>
            <p className="navDrawer__eyebrow">Menu</p>
            <h2>{isAuthed ? `Welcome ${firstName || "back"}` : "Welcome"}</h2>
          </div>

          <button
            type="button"
            className="navDrawer__close"
            onClick={closeMenu}
            aria-label="Close navigation menu"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        <nav className="navDrawer__links" aria-label="Drawer navigation">
          <Link to="/destinations" onClick={closeMenu}>
            Destinations
          </Link>
          <Link to="/deals" onClick={closeMenu}>
            Deals
          </Link>
          <Link to="/support" onClick={closeMenu}>
            Support
          </Link>

          {isAuthed ? (
            <>
              <Link to="/profile" onClick={closeMenu}>
                Profile
              </Link>
              <Link to="/reviews" onClick={closeMenu}>
                Reviews
              </Link>
              <Link to="/bookings" onClick={closeMenu}>
                Bookings
              </Link>
              <Link to="/settings" onClick={closeMenu}>
                Settings
              </Link>
            </>
          ) : null}
        </nav>

        <div className="navDrawer__actions">
          {isAuthed ? (
            <button
              className="btn btn--primary"
              type="button"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          ) : (
            <>
              <Link to="/auth" className="btn btn--muted" onClick={closeMenu}>
                Sign In
              </Link>
              <Link to="/auth" className="btn btn--primary" onClick={closeMenu}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </aside>
    </header>
  );
}
