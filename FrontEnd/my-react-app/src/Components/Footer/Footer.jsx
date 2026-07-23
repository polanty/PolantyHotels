import { useState } from "react";

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container footer__inner">
        <div className="footerGrid">
          {/* Brand */}
          <div className="footerBrand">
            <div className="brand brand--footer">
              <span
                className="material-symbols-outlined brand__icon"
                aria-hidden="true"
              >
                travel_explore
              </span>
              <h2 className="brand__name">Voyage</h2>
            </div>
            <p className="footerBrand__text">
              Your journey begins here. Book your dream stay with us.
            </p>
          </div>

          {/* Company */}
          <FooterColumn
            title="Company"
            links={[
              { label: "About Us", href: "#" },
              { label: "Careers", href: "#" },
              { label: "Press", href: "#" },
            ]}
          />

          {/* Explore */}
          <FooterColumn
            title="Explore"
            links={[
              { label: "Hotels in Paris", href: "#" },
              { label: "Apartments in Tokyo", href: "#" },
              { label: "Resorts in Bali", href: "#" },
            ]}
          />

          {/* Support */}
          <FooterColumn
            title="Support"
            links={[
              { label: "Help Center", href: "#" },
              { label: "Contact Us", href: "#" },
              { label: "FAQs", href: "#" },
            ]}
          />

          {/* Legal  */}
          <FooterColumn
            title="Legal"
            links={[
              { label: "Terms of Service", href: "#" },
              { label: "Privacy Policy", href: "#" },
            ]}
          />
        </div>

        {/* Bottom Section  */}
        <div className="footerBottom">
          <p>© 2024 Voyage. All rights reserved.</p>

          <div className="footerIcons" aria-label="Social media">
            <a
              className="footerSocialLink"
              href="https://www.facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Visit Voyage on Facebook"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13.5 22v-9h3l.45-3.5H13.5V7.26c0-1.01.28-1.7 1.74-1.7H17.1V2.43c-.32-.04-1.43-.13-2.72-.13-2.69 0-4.53 1.64-4.53 4.66V9.5H6.8V13h3.05v9h3.65Z" />
              </svg>
            </a>
            <a
              className="footerSocialLink"
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Visit Voyage on Instagram"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
              </svg>
            </a>
            <a
              className="footerSocialLink"
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Visit Voyage on X"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.26-8.3L2.97 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.84h1.72L8.43 4.05H6.58L17.8 19.84Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Reusable component for footer columns
function FooterColumn({ title, links }) {
  const [isOpen, setIsOpen] = useState(false);
  const listId = `footer-list-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className={`footerCol ${isOpen ? "footerCol--open" : ""}`}>
      <button
        type="button"
        className="footerCol__title"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{title}</span>
        <span
          className="material-symbols-outlined footerCol__toggleIcon"
          aria-hidden="true"
        >
          keyboard_arrow_down
        </span>
      </button>

      <ul id={listId} className="footerList">
        {links.map((link, index) => (
          <li key={`${title}-${index}`}>
            <a className="footerLink" href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
