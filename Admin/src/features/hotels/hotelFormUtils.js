export const initialHotelForm = {
  brandMode: "existing",
  brand_id: "",
  brandName: "",
  brandDescription: "",
  brandRating: "4",
  name: "",
  address: "",
  city: "",
  country: "",
  postal_code: "",
  latitude: "",
  longitude: "",
  email: "",
  existingAmenityIds: [],
  newAmenities: [{ category: "", name: "", description: "" }],
  rooms: [createInitialRoomForm()],
};

export function createInitialRoomForm() {
  return {
    roomTypeName: "Deluxe",
    roomTypeDescription: "",
    capacity: "2",
    bed_configuration: "",
    size_sqm: "21",
    base_price_per_night: "",
    currency: "GBP",
    effective_date: new Date().toISOString().slice(0, 10),
    isAvailable: "1",
    images: [],
    imageErrors: [],
  };
}

export const roomImageRequirements = {
  minCount: 5,
  minWidth: 1200,
  minHeight: 800,
  minSizeBytes: 150 * 1024,
};

export function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data ||
    error.message ||
    "Request failed"
  );
}

export async function getImageDimensions(file) {
  const objectUrl = URL.createObjectURL(file);

  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () =>
        resolve({ width: image.width, height: image.height });
      image.onerror = reject;
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function validateRoomImages(files) {
  const errors = [];
  const validImages = [];

  if (files.length < roomImageRequirements.minCount) {
    errors.push(`Select at least ${roomImageRequirements.minCount} room images.`);
  }

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      errors.push(`${file.name} is not an image.`);
      continue;
    }

    if (file.size < roomImageRequirements.minSizeBytes) {
      errors.push(`${file.name} is below 150KB.`);
      continue;
    }

    const dimensions = await getImageDimensions(file);
    if (
      dimensions.width < roomImageRequirements.minWidth ||
      dimensions.height < roomImageRequirements.minHeight
    ) {
      errors.push(
        `${file.name} must be at least ${roomImageRequirements.minWidth}x${roomImageRequirements.minHeight}px.`,
      );
      continue;
    }

    validImages.push(file);
  }

  return { errors, validImages };
}
