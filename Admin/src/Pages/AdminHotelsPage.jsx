import { useState } from "react";
import CreateHotelForm from "../features/hotels/CreateHotelForm.jsx";
import ManageHotelsPanel from "../features/hotels/ManageHotelsPanel.jsx";

export default function AdminHotelsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="adminShell adminDashboard">
      <section className="adminHero">
        <p className="adminEyebrow">Hotel inventory</p>
        <h1>Hotels</h1>
        <p>
          Retrieve, update, delete, and create hotels with room types, pricing,
          amenities, and high-quality image sets.
        </p>
      </section>

      <ManageHotelsPanel refreshKey={refreshKey} />
      <CreateHotelForm onCreated={() => setRefreshKey((key) => key + 1)} />
    </main>
  );
}
