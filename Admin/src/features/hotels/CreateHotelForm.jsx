import { useEffect, useMemo, useRef, useState } from "react";
import { adminEndpoints } from "../../axios/axios.endpoint";
import {
  createInitialRoomForm,
  getErrorMessage,
  initialHotelForm,
  roomImageRequirements,
  validateRoomImages,
} from "./hotelFormUtils";

const roomTypeOptions = ["Single", "Double", "Suite", "Deluxe", "Family"];
const currencyOptions = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"];

export default function CreateHotelForm({ onCreated }) {
  const [form, setForm] = useState(initialHotelForm);
  const [brands, setBrands] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const roomsRef = useRef(form.rooms);

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

  useEffect(() => {
    roomsRef.current = form.rooms;
  }, [form.rooms]);

  useEffect(
    () => () => {
      roomsRef.current.forEach((room) =>
        room.images.forEach((image) => URL.revokeObjectURL(image.previewUrl)),
      );
    },
    [],
  );

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const updateRoom = (index, field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      rooms: currentForm.rooms.map((room, roomIndex) =>
        roomIndex === index ? { ...room, [field]: value } : room,
      ),
    }));
  };

  const addRoom = () => {
    setForm((currentForm) => ({
      ...currentForm,
      rooms: [...currentForm.rooms, createInitialRoomForm()],
    }));
  };

  const removeRoom = (index) => {
    setForm((currentForm) => {
      const roomToRemove = currentForm.rooms[index];
      roomToRemove.images.forEach((image) => URL.revokeObjectURL(image.previewUrl));

      return {
        ...currentForm,
        rooms: currentForm.rooms.filter((_, roomIndex) => roomIndex !== index),
      };
    });
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

  const handleRoomImageChange = async (roomIndex, event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const { errors, validImages } = await validateRoomImages(selectedFiles);
    const imagePreviews = validImages.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setForm((currentForm) => ({
      ...currentForm,
      rooms: currentForm.rooms.map((room, index) => {
        if (index !== roomIndex) return room;

        room.images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
        return { ...room, images: imagePreviews, imageErrors: errors };
      }),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const invalidRoom = form.rooms.find(
        (room) =>
          room.images.length < roomImageRequirements.minCount ||
          room.imageErrors.length > 0,
      );

      if (invalidRoom) {
        throw new Error("Each room needs at least 5 high-quality images.");
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

      for (const room of form.rooms) {
        const roomTypeResponse = await adminEndpoints.createRoomType({
          brand_id: brandId,
          name: room.roomTypeName,
          description: room.roomTypeDescription,
          capacity: Number(room.capacity),
          bed_configuration: room.bed_configuration,
          size_sqm: Number(room.size_sqm),
        });
        const roomTypeId = roomTypeResponse.data?.data?.RoomType?.[0]?._id;

        if (!roomTypeId) {
          throw new Error("Room type was created, but the response did not include an ID.");
        }

        await adminEndpoints.createPricing({
          room_type_id: roomTypeId,
          base_price_per_night: Number(room.base_price_per_night),
          currency: room.currency,
          effective_date: room.effective_date,
        });

        const roomFormData = new FormData();
        roomFormData.append("location_id", locationId);
        roomFormData.append("room_type_id", roomTypeId);
        roomFormData.append("isAvailable", room.isAvailable);
        room.images.forEach((image) => roomFormData.append("images", image.file));

        await adminEndpoints.createRoom(roomFormData);
      }

      setStatus("succeeded");
      setMessage(`Hotel and ${form.rooms.length} room type(s) were created.`);
      form.rooms.forEach((room) =>
        room.images.forEach((image) => URL.revokeObjectURL(image.previewUrl)),
      );
      setForm({ ...initialHotelForm, rooms: [createInitialRoomForm()] });
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
        <h2>Create hotel and rooms</h2>
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
          <legend>Rooms</legend>
          <div className="roomFormList">
            {form.rooms.map((room, index) => (
              <article className="roomFormCard" key={index}>
                <div className="panelHeader">
                  <h3>Room {index + 1}</h3>
                  {form.rooms.length > 1 && (
                    <button
                      type="button"
                      className="dangerButton"
                      onClick={() => removeRoom(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="inlineFields">
                  <label htmlFor={`roomTypeName-${index}`}>
                    Room type
                    <select
                      id={`roomTypeName-${index}`}
                      value={room.roomTypeName}
                      onChange={(event) =>
                        updateRoom(index, "roomTypeName", event.target.value)
                      }
                    >
                      {roomTypeOptions.map((roomType) => (
                        <option key={roomType} value={roomType}>
                          {roomType}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label htmlFor={`capacity-${index}`}>
                    Capacity
                    <input
                      id={`capacity-${index}`}
                      type="number"
                      min="1"
                      max="3"
                      value={room.capacity}
                      onChange={(event) =>
                        updateRoom(index, "capacity", event.target.value)
                      }
                      required
                    />
                  </label>
                  <label htmlFor={`isAvailable-${index}`}>
                    Available rooms
                    <input
                      id={`isAvailable-${index}`}
                      type="number"
                      min="1"
                      value={room.isAvailable}
                      onChange={(event) =>
                        updateRoom(index, "isAvailable", event.target.value)
                      }
                      required
                    />
                  </label>
                </div>

                <label htmlFor={`roomTypeDescription-${index}`}>
                  Description
                  <textarea
                    id={`roomTypeDescription-${index}`}
                    value={room.roomTypeDescription}
                    onChange={(event) =>
                      updateRoom(index, "roomTypeDescription", event.target.value)
                    }
                    required
                  />
                </label>

                <div className="inlineFields">
                  <label htmlFor={`bed_configuration-${index}`}>
                    Bed configuration
                    <input
                      id={`bed_configuration-${index}`}
                      value={room.bed_configuration}
                      onChange={(event) =>
                        updateRoom(index, "bed_configuration", event.target.value)
                      }
                      required
                    />
                  </label>
                  <label htmlFor={`size_sqm-${index}`}>
                    Size sqm
                    <input
                      id={`size_sqm-${index}`}
                      type="number"
                      min="1"
                      value={room.size_sqm}
                      onChange={(event) =>
                        updateRoom(index, "size_sqm", event.target.value)
                      }
                      required
                    />
                  </label>
                  <label htmlFor={`base_price_per_night-${index}`}>
                    Base price per night
                    <input
                      id={`base_price_per_night-${index}`}
                      type="number"
                      min="0"
                      value={room.base_price_per_night}
                      onChange={(event) =>
                        updateRoom(index, "base_price_per_night", event.target.value)
                      }
                      required
                    />
                  </label>
                </div>

                <div className="inlineFields">
                  <label htmlFor={`currency-${index}`}>
                    Currency
                    <select
                      id={`currency-${index}`}
                      value={room.currency}
                      onChange={(event) =>
                        updateRoom(index, "currency", event.target.value)
                      }
                    >
                      {currencyOptions.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label htmlFor={`effective_date-${index}`}>
                    Effective date
                    <input
                      id={`effective_date-${index}`}
                      type="date"
                      value={room.effective_date}
                      onChange={(event) =>
                        updateRoom(index, "effective_date", event.target.value)
                      }
                      required
                    />
                  </label>
                  <label htmlFor={`images-${index}`}>
                    Room images
                    <input
                      id={`images-${index}`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(event) => handleRoomImageChange(index, event)}
                      required
                    />
                  </label>
                </div>

                <p>
                  Upload at least 5 images. Each image must be at least 1200x800px
                  and 150KB.
                </p>
                {room.imageErrors.length > 0 && (
                  <div className="authMessage error">
                    {room.imageErrors.map((error) => (
                      <p key={error}>{error}</p>
                    ))}
                  </div>
                )}
                {room.images.length > 0 && (
                  <div className="imagePreviewGrid">
                    {room.images.map((image) => (
                      <figure key={image.previewUrl}>
                        <img src={image.previewUrl} alt={image.file.name} />
                        <figcaption>{image.file.name}</figcaption>
                      </figure>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
          <button type="button" className="secondaryButton" onClick={addRoom}>
            Add another room
          </button>
        </fieldset>

        <div className="formActions">
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Creating..." : "Create hotel rooms"}
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
