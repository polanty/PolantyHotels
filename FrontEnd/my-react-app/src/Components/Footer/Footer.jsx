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

          <div className="footerIcons">
            <a className="footerLink" href="#">
              Icon1
            </a>
            <a className="footerLink" href="#">
              Icon2
            </a>
            <a className="footerLink" href="#">
              Icon3
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
