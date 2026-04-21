export function Spinner() {
  return (
    <div className="spinnerWrap" role="status" aria-live="polite">
      <div className="spinner" />
      <p>Loading hotels...</p>
    </div>
  );
}

//  Safely normalize amenities from API response.
//  Your API may return strings or objects like:
//  { category, name, description }
export function NormalizeAmenities(amenities = []) {
  if (!Array.isArray(amenities)) return [];

  return amenities
    .map((item, index) => {
      // If it's already a string
      if (typeof item === "string") {
        return {
          id: `${item}-${index}`,
          name: item,
          description: "",
          category: "",
        };
      }

      // If it's an object
      if (typeof item === "object" && item !== null) {
        return {
          id: `${item.name || item.category || "amenity"}-${index}`,
          name: item.name || item.category || "Amenity",
          description: item.description || "",
          category: item.category || "",
        };
      }

      // Fallback for unexpected values
      return {
        id: `amenity-${index}`,
        name: "Amenity",
        description: "",
        category: "",
      };
    })
    .filter(Boolean);
}
