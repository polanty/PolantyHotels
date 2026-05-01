const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function Map({ lat, lon, zoom = 12 }) {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  // console.log(MAPBOX_TOKEN);
  useEffect(() => {
    if (!lat || !lon) return; // prevent map from loading with invalid coords

    mapboxgl.accessToken = MAPBOX_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [lon, lat], // dynamic coords
      zoom,
    });

    // Add marker
    new mapboxgl.Marker().setLngLat([lon, lat]).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
    };
  }, [lat, lon, zoom]);

  return (
    <div id="map-container" ref={mapContainerRef} className="mapbox-map" />
  );
}

export default Map;
