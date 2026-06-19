import { useSelector } from "react-redux";
import { selectUser } from "../Redux/auth/auth.selectors";

export default function AdminWelcomePage() {
  const adminUser = useSelector(selectUser);
  const displayName = adminUser?.first_name || adminUser?.email || "Admin";

  // console.log("This is the admin user:", adminUser);

  return (
    <main className="adminShell">
      <section className="adminHero">
        <p className="adminEyebrow">Polanty Hotels</p>
        <h1>Welcome, {displayName}</h1>
        <p>
          You are signed in to the admin area. This page is ready for your
          hotel, booking, room, and user management tools.
        </p>
      </section>
    </main>
  );
}
