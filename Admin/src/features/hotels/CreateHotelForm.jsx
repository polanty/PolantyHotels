import { useEffect, useMemo, useState } from "react";
import { adminEndpoints } from "../../axios/axios.endpoint";
import {
  getErrorMessage,
  initialHotelForm,
  roomImageRequirements,
  validateRoomImages,
} from "./hotelFormUtils";

export default function CreateHotelForm({ onCreated }) {
  const [form, setForm] = useState(initialHotelForm);
  const [brands, setBrands] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const [imageErrors, setImageErrors] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const selectedAmenityCount = useMemo(
    () =>
      form.existingAmenityIds.length +
      form.newAmenities.filter(
        (amenity) =>
          amenity.category.trim() &&
          amenity.name.trim() &&
          amenity.description.trim(),
      ).length,
    [form.existingAmenityIds, form.newAmenities],
  );

  useEffect(() => {
    async function loadOptions() {
      try {
        const [brandsResponse, amenitiesResponse] = await Promise.all([
          adminEndpoints.getBrands({ limit: 100 }),
          adminEndpoints.getAmenities(),
        ]);

        setBrands(brandsResponse.data?.data?.data?.allHotels || []);
        setAmenities(amenitiesResponse.data?.data?.amenities || []);
      } catch (error) {
        setMessage(getErrorMessage(error));
      }
    }

    loadOptions();
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const updateAmenity = (index, field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      newAmenities: currentForm.newAmenities.map((amenity, amenityIndex) =>
        amenityIndex === index ? { ...amenity, [field]: value } : amenity,
      ),
    }));
  };

  const addAmenityRow = () => {
    setForm((currentForm) => ({
      ...currentForm,
      newAmenities: [
        ...currentForm.newAmenities,
        { category: "", name: "", description: "" },
      ],
    }));
  };

  const toggleExistingAmenity = (amenityId) => {
    setForm((currentForm) => {
      const hasAmenity = currentForm.existingAmenityIds.includes(amenityId);
      return {
        ...currentForm,
        existingAmenityIds: hasAmenity
          ? currentForm.existingAmenityIds.filter((id) => id !== amenityId)
          : [...currentForm.existingAmenityIds, amenityId],
      };
    });
  };

  const handleImageChange = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const { errors, validImages } = await validateRoomImages(selectedFiles);

    setImages(validImages);
    setImageErrors(errors);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      if (
        images.length < roomImageRequirements.minCount ||
        imageErrors.length > 0
      ) {
        throw new Error("Please provide at least 5 high-quality room images.");
      }

      let brandId = form.brand_id;

      if (form.brandMode === "new") {
        const brandResponse = await adminEndpoints.createBrand({
          name: form.brandName,
          description: form.brandDescription,
          rating: Number(form.brandRating),
        });
        brandId = brandResponse.data?.data?.hotel?._id;
      }

      if (!brandId) {
        throw new Error("Choose an existing brand or create a new brand.");
      }

      const newAmenityPayload = form.newAmenities.filter(
        (amenity) =>
          amenity.category.trim() &&
          amenity.name.trim() &&
          amenity.description.trim(),
      );
      let createdAmenityIds = [];

      if (newAmenityPayload.length > 0) {
        const amenitiesResponse =
          await adminEndpoints.createAmenities(newAmenityPayload);
        createdAmenityIds =
          amenitiesResponse.data?.data?.newAmenities?.map(
            (amenity) => amenity._id,
          ) || [];
      }

      const amenityIds = [...form.existingAmenityIds, ...createdAmenityIds];
      if (amenityIds.length === 0) {
        throw new Error("Select or create at least one hotel amenity.");
      }

      const hotelResponse = await adminEndpoints.createHotel({
        brand_id: brandId,
        name: form.name,
        address: form.address,
        city: form.city,
        country: form.country,
        postal_code: form.postal_code,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        location: {
          type: "Point",
          coordinates: [Number(form.longitude), Number(form.latitude)],
        },
        email: form.email,
        amenities: amenityIds,
      });

      const hotel = hotelResponse.data?.data?.Hotel?.[0];
      const locationId = hotel?._id;

      if (!locationId) {
        throw new Error("Hotel was created, but the response did not include an ID.");
      }

      const roomTypeResponse = await adminEndpoints.createRoomType({
        brand_id: brandId,
        name: form.roomTypeName,
        description: form.roomTypeDescription,
        capacity: Number(form.capacity),
        bed_configuration: form.bed_configuration,
        size_sqm: Number(form.size_sqm),
      });
      const roomTypeId = roomTypeResponse.data?.data?.RoomType?.[0]?._id;

      if (!roomTypeId) {
        throw new Error("Room type was created, but the response did not include an ID.");
      }

      await adminEndpoints.createPricing({
        room_type_id: roomTypeId,
        base_price_per_night: Number(form.base_price_per_night),
        currency: form.currency,
        effective_date: form.effective_date,
      });

      const roomFormData = new FormData();
      roomFormData.append("location_id", locationId);
      roomFormData.append("room_type_id", roomTypeId);
      roomFormData.append("isAvailable", form.isAvailable);
      images.forEach((image) => roomFormData.append("images", image));

      await adminEndpoints.createRoom(roomFormData);

      setStatus("succeeded");
      setMessage("Hotel, room type, pricing, and room images were created.");
      setForm(initialHotelForm);
      setImages([]);
      setImageErrors([]);
      onCreated?.();
    } catch (error) {
      setStatus("failed");
      setMessage(getErrorMessage(error));
    }
  };

  return (
    <section className="usersPanel fullPanel">
      <div>
        <p className="adminEyebrow">Create</p>
        <h2>Create hotel and room</h2>
      </div>

      <form className="loginForm twoColumnForm" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Brand</legend>
          <label htmlFor="brandMode">
            Brand mode
            <select
              id="brandMode"
              name="brandMode"
              value={form.brandMode}
              onChange={updateField}
            >
              <option value="existing">Use existing brand</option>
              <option value="new">Create new brand</option>
            </select>
          </label>

          {form.brandMode === "existing" ? (
            <label htmlFor="brand_id">
              Existing brand
              <select
                id="brand_id"
                name="brand_id"
                value={form.brand_id}
                onChange={updateField}
                required={form.brandMode === "existing"}
              >
                <option value="">Select brand</option>
                {brands.map((brand) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <>
              <label htmlFor="brandName">
                Brand name
                <input
                  id="brandName"
                  name="brandName"
                  value={form.brandName}
                  onChange={updateField}
                  required={form.brandMode === "new"}
                />
              </label>
              <label htmlFor="brandDescription">
                Brand description
                <textarea
                  id="brandDescription"
                  name="brandDescription"
                  value={form.brandDescription}
                  onChange={updateField}
                  required={form.brandMode === "new"}
                />
              </label>
            </>
          )}
        </fieldset>

        <fieldset>
          <legend>Hotel details</legend>
          {[
            ["name", "Hotel name"],
            ["address", "Address"],
            ["city", "City"],
            ["country", "Country"],
            ["postal_code", "Postal code"],
            ["email", "Hotel email"],
          ].map(([name, label]) => (
            <label htmlFor={name} key={name}>
              {label}
              <input
                id={name}
                name={name}
                type={name === "email" ? "email" : "text"}
                value={form[name]}
                onChange={updateField}
                required
              />
            </label>
          ))}
          <label htmlFor="latitude">
            Latitude
            <input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              value={form.latitude}
              onChange={updateField}
              required
            />
          </label>
          <label htmlFor="longitude">
            Longitude
            <input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              value={form.longitude}
              onChange={updateField}
              required
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Amenities</legend>
          <div className="checkGrid">
            {amenities.map((amenity) => (
              <label key={amenity._id}>
                <input
                  type="checkbox"
                  checked={form.existingAmenityIds.includes(amenity._id)}
                  onChange={() => toggleExistingAmenity(amenity._id)}
                />
                {amenity.name}
              </label>
            ))}
          </div>
          {form.newAmenities.map((amenity, index) => (
            <div className="inlineFields" key={index}>
              <input
                placeholder="Category"
                value={amenity.category}
                onChange={(event) =>
                  updateAmenity(index, "category", event.target.value)
                }
              />
              <input
                placeholder="Name"
                value={amenity.name}
                onChange={(event) =>
                  updateAmenity(index, "name", event.target.value)
                }
              />
              <input
                placeholder="Description"
                value={amenity.description}
                onChange={(event) =>
                  updateAmenity(index, "description", event.target.value)
                }
              />
            </div>
          ))}
          <button type="button" className="secondaryButton" onClick={addAmenityRow}>
            Add amenity row
          </button>
          <p>{selectedAmenityCount} amenities selected or ready to create.</p>
        </fieldset>

        <fieldset>
          <legend>Room type and pricing</legend>
          <label htmlFor="roomTypeName">
            Room type
            <select
              id="roomTypeName"
              name="roomTypeName"
              value={form.roomTypeName}
              onChange={updateField}
            >
              {["Single", "Double", "Suite", "Deluxe", "Family"].map(
                (roomType) => (
                  <option key={roomType} value={roomType}>
                    {roomType}
                  </option>
                ),
              )}
            </select>
          </label>
          <label htmlFor="roomTypeDescription">
            Description
            <textarea
              id="roomTypeDescription"
              name="roomTypeDescription"
              value={form.roomTypeDescription}
              onChange={updateField}
              required
            />
          </label>
          {[
            ["capacity", "Capacity"],
            ["bed_configuration", "Bed configuration"],
            ["size_sqm", "Size sqm"],
            ["base_price_per_night", "Base price per night"],
          ].map(([name, label]) => (
            <label htmlFor={name} key={name}>
              {label}
              <input
                id={name}
                name={name}
                type={name === "bed_configuration" ? "text" : "number"}
                min={name === "base_price_per_night" ? "0" : "1"}
                max={name === "capacity" ? "3" : undefined}
                value={form[name]}
                onChange={updateField}
                required
              />
            </label>
          ))}
          <label htmlFor="currency">
            Currency
            <select
              id="currency"
              name="currency"
              value={form.currency}
              onChange={updateField}
            >
              {["USD", "EUR", "GBP", "JPY", "AUD", "CAD"].map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        <fieldset>
          <legend>Room availability and images</legend>
          <label htmlFor="isAvailable">
            Available rooms
            <input
              id="isAvailable"
              name="isAvailable"
              type="number"
              min="1"
              value={form.isAvailable}
              onChange={updateField}
              required
            />
          </label>
          <label htmlFor="images">
            Room images
            <input
              id="images"
              name="images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageChange}
              required
            />
          </label>
          <p>
            Upload at least 5 images. Each image must be at least 1200x800px
            and 150KB.
          </p>
          {imageErrors.length > 0 && (
            <div className="authMessage error">
              {imageErrors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
          {images.length > 0 && (
            <p>{images.length} high-quality images ready to upload.</p>
          )}
        </fieldset>

        <div className="formActions">
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Creating..." : "Create hotel room"}
          </button>
        </div>
      </form>

      {message && (
        <p
          className={
            status === "succeeded" ? "authMessage success" : "authMessage error"
          }
        >
          {message}
        </p>
      )}
    </section>
  );
}
