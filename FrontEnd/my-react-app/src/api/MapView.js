import Map from "react-map-gl/mapbox";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

function MapView() {
  return (
    <div style={{ width: "100%", height: "400px" }}>
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: -3.0, // e.g. near Liverpool
          latitude: 53.4,
          zoom: 10,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
      />
    </div>
  );
}

export default MapView;
