import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import Select from "react-select";
import Title from "../../components/Title";

const MAX_IMAGES = 10;
const MAX_SIZE_MB = 2;

const roomTypes = [
  {
    label: "Standard Rooms",
    options: [
      {
        value: "Single Bed",
        label: "🛏️ Single Bed - Ideal for solo travelers",
      },
      { value: "Double Bed", label: "🛏️🛏️ Double Bed - Perfect for couples" },
      { value: "Deluxe Room", label: "✨ Deluxe Room - Upgraded amenities" },
    ],
  },
  {
    label: "Suites",
    options: [
      { value: "Luxury Room", label: "🏡 Luxury Room - High-end furnishings" },
      {
        value: "Family Suite",
        label: "👨‍👩‍👦 Family Suite - Spacious for families",
      },
      {
        value: "Executive Suite",
        label: "💼 Executive Suite - Business travelers",
      },
      {
        value: "Presidential Suite",
        label: "🏛️ Presidential Suite - Ultimate luxury",
      },
      {
        value: "Honeymoon Suite",
        label: "💖 Honeymoon Suite - Romantic setting",
      },
    ],
  },
  {
    label: "Specialty Rooms",
    options: [
      { value: "Penthouse", label: "🏙️ Penthouse - Top-floor with views" },
      {
        value: "Studio Apartment",
        label: "🏡 Studio Apartment - Compact living",
      },
      {
        value: "Beachfront Suite",
        label: "🏖️ Beachfront Suite - Stunning ocean views",
      },
      { value: "Cabana", label: "🌴 Cabana - Near pool or beach" },
      { value: "Bungalow", label: "🏠 Bungalow - Single-story home style" },
      { value: "Loft", label: "🏢 Loft - High ceilings, open-plan" },
      { value: "Villa", label: "🏘️ Villa - Luxury standalone property" },
      { value: "Cottage", label: "🏡 Cottage - Cozy retreat" },
    ],
  },
  {
    label: "Other Spaces",
    options: [
      { value: "Conference Room", label: "📊 Conference Room - For meetings" },
      { value: "Dormitory", label: "🛏️ Dormitory - Shared space for groups" },
      {
        value: "Tatami Room",
        label: "🎌 Tatami Room - Traditional Japanese style",
      },
    ],
  },
];

const bedTypes = [
  { value: "Single", label: "Single Bed" },
  { value: "Double", label: "Double Bed" },
  { value: "Queen", label: "Queen Bed" },
  { value: "King", label: "King Bed" },
  { value: "Sofa Bed", label: "Sofa Bed" },
  { value: "Bunk Bed", label: "Bunk Bed" },
];

const AddRoom = () => {
  const { getToken } = useAuth();
  const fileInputRef = useRef();
  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [userHotels, setUserHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [input, setInput] = useState({
    hotel: "",
    roomType: null,
    roomNumber: "",
    pricePerNight: "",
    maxGuests: 1,
    maxAdults: 1,
    maxChildren: 0,
    beds: [{ type: "Double", count: 1 }],
    description: "",
    size: { value: "", unit: "sqm" },
    totalRooms: 1,
    availableRooms: 1,
    smoking: false,
    petsAllowed: false,
    amenities: {
      "Free Wifi": false,
      "Free Breakfast": false,
      "Room Service": false,
      "Mountain view": false,
      "Pool Access": false,
      "Gym Access": false,
      "Spa and wellness Center": false,
      "All Inclusive Package": false,
      "Business Center": false,
      "Event Space": false,
      "Airport Lounge Access": false,
      "Kids Play Area": false,
      "Ocean View": false,
      "Shuttle Service": false,
      "Laundry Service": false,
      "Air Conditioning": false,
      TV: false,
      "Mini Bar": false,
      Safe: false,
      "Hair Dryer": false,
      "Coffee Maker": false,
      Balcony: false,
    },
  });

  // Fetch user's hotels
  useEffect(() => {
    const fetchUserHotels = async () => {
      try {
        const token = await getToken();
        const response = await fetch(
          "http://localhost:5000/api/hotels/owner/my-hotels",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.length > 0) {
            setUserHotels(result.data);
            // Auto-select the first hotel if only one exists
            if (result.data.length === 1) {
              setInput((prev) => ({ ...prev, hotel: result.data[0]._id }));
            }
          }
        }
      } catch (err) {
        console.error("Error fetching user hotels:", err);
        setError("Failed to load your hotels");
      }
    };

    fetchUserHotels();
  }, [getToken]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(
      (file) => file.size <= MAX_SIZE_MB * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      setError("One or more files exceed the 2MB size limit.");
      return;
    }

    if (images.length + validFiles.length > MAX_IMAGES) {
      setError(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    setImages([...images, ...validFiles]);
    setError(""); // Clear previous errors
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(
      (file) => file.size <= MAX_SIZE_MB * 1024 * 1024
    );

    if (validFiles.length !== droppedFiles.length) {
      setError("Some files are too large (2MB max).");
      return;
    }

    if (images.length + validFiles.length > MAX_IMAGES) {
      setError(`You can upload up to ${MAX_IMAGES} images total.`);
      return;
    }

    setImages([...images, ...validFiles]);
    setError("");
  };

  const handleRemoveImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const handleAddBed = () => {
    setInput({
      ...input,
      beds: [...input.beds, { type: "Double", count: 1 }],
    });
  };

  const handleRemoveBed = (index) => {
    if (input.beds.length > 1) {
      const updatedBeds = input.beds.filter((_, i) => i !== index);
      setInput({ ...input, beds: updatedBeds });
    }
  };

  const handleBedChange = (index, field, value) => {
    const updatedBeds = input.beds.map((bed, i) =>
      i === index ? { ...bed, [field]: value } : bed
    );
    setInput({ ...input, beds: updatedBeds });
  };

  const uploadImages = async (token) => {
    const uploadedImages = [];

    for (const image of images) {
      const formData = new FormData();
      formData.append("image", image);

      try {
        const response = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          uploadedImages.push({
            url: result.url,
            caption: `Room ${input.roomNumber}`,
            isPrimary: uploadedImages.length === 0, // First image is primary
          });
        } else {
          throw new Error("Image upload failed");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        throw new Error("Failed to upload some images");
      }
    }

    return uploadedImages;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validation
      if (!input.hotel) {
        throw new Error("Please select a hotel");
      }
      if (!input.roomType) {
        throw new Error("Please select a room type");
      }
      if (!input.roomNumber.trim()) {
        throw new Error("Please enter a room number");
      }
      if (!input.pricePerNight || input.pricePerNight <= 0) {
        throw new Error("Please enter a valid price per night");
      }
      if (images.length === 0) {
        throw new Error("Please upload at least one image");
      }

      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      // Upload images first
      const uploadedImages = await uploadImages(token);

      // Prepare amenities array from selected amenities
      const selectedAmenities = Object.keys(input.amenities).filter(
        (key) => input.amenities[key]
      );

      // Prepare room data
      const roomData = {
        hotel: input.hotel,
        roomType: input.roomType.value,
        roomNumber: input.roomNumber,
        pricePerNight: parseFloat(input.pricePerNight),
        maxGuests: parseInt(input.maxGuests),
        maxAdults: parseInt(input.maxAdults),
        maxChildren: parseInt(input.maxChildren),
        beds: input.beds,
        description: input.description,
        size: input.size.value
          ? {
              value: parseFloat(input.size.value),
              unit: input.size.unit,
            }
          : undefined,
        amenities: selectedAmenities,
        images: uploadedImages,
        totalRooms: parseInt(input.totalRooms),
        availableRooms: parseInt(input.availableRooms),
        smoking: input.smoking,
        petsAllowed: input.petsAllowed,
        currency: "NGN",
      };

      // Submit room data
      const response = await fetch("http://localhost:5000/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roomData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add room");
      }

      if (result.success) {
        setSuccess("Room added successfully!");
        // Reset form
        setInput({
          hotel: userHotels.length === 1 ? userHotels[0]._id : "",
          roomType: null,
          roomNumber: "",
          pricePerNight: "",
          maxGuests: 1,
          maxAdults: 1,
          maxChildren: 0,
          beds: [{ type: "Double", count: 1 }],
          description: "",
          size: { value: "", unit: "sqm" },
          totalRooms: 1,
          availableRooms: 1,
          smoking: false,
          petsAllowed: false,
          amenities: Object.keys(input.amenities).reduce((acc, key) => {
            acc[key] = false;
            return acc;
          }, {}),
        });
        setImages([]);
      } else {
        throw new Error(result.message || "Failed to add room");
      }
    } catch (err) {
      console.error("Error adding room:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Title
        align="left"
        font="outfit"
        title="Add Room"
        subTitle="Fill in the details carefully to ensure a great booking experience."
      />

      {/* Error & Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      {/* Hotel Selection */}
      {userHotels.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Hotel *
          </label>
          <select
            value={input.hotel}
            onChange={(e) => setInput({ ...input, hotel: e.target.value })}
            className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            required
          >
            <option value="">Choose a hotel</option>
            {userHotels.map((hotel) => (
              <option key={hotel._id} value={hotel._id}>
                {hotel.name} - {hotel.city}
              </option>
            ))}
          </select>
        </div>
      )}

      {userHotels.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-700">
            You need to register a hotel before adding rooms.
            <a href="/owner" className="underline ml-1">
              Go to Dashboard
            </a>
          </p>
        </div>
      )}

      {/* Image Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Room Images *
        </label>
        <div
          onClick={() => fileInputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border border-dashed border-gray-400 p-8 rounded-md text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
        >
          <div className="text-gray-400 mb-2">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-1">
            Click or drag & drop images here
          </p>
          <p className="text-xs text-gray-500">
            Maximum {MAX_IMAGES} images, {MAX_SIZE_MB}MB each
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            ref={fileInputRef}
            onChange={handleImageChange}
          />
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              {images.length} image(s) selected
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-full object-cover rounded-lg shadow cursor-pointer hover:opacity-90 transition"
                    onClick={() => setPreviewImage(URL.createObjectURL(img))}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center shadow hover:bg-red-600 transition"
                  >
                    ✕
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Room Basic Information */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Type *
          </label>
          <Select
            options={roomTypes}
            value={input.roomType}
            onChange={(option) => setInput({ ...input, roomType: option })}
            placeholder="Select Room Type..."
            className="react-select-container"
            classNamePrefix="react-select"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Number *
          </label>
          <input
            type="text"
            placeholder="e.g., 101, A12, Suite-1"
            className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            value={input.roomNumber}
            onChange={(e) => setInput({ ...input, roomNumber: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price per Night (₦) *
          </label>
          <input
            type="number"
            placeholder="e.g., 25000"
            min="0"
            step="100"
            className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            value={input.pricePerNight}
            onChange={(e) =>
              setInput({ ...input, pricePerNight: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Size (sqm)
          </label>
          <input
            type="number"
            placeholder="e.g., 35"
            min="0"
            className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            value={input.size.value}
            onChange={(e) =>
              setInput({
                ...input,
                size: { ...input.size, value: e.target.value },
              })
            }
          />
        </div>
      </div>

      {/* Guest Capacity */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Guest Capacity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Guests *
            </label>
            <input
              type="number"
              min="1"
              max="20"
              className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={input.maxGuests}
              onChange={(e) =>
                setInput({ ...input, maxGuests: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Adults
            </label>
            <input
              type="number"
              min="1"
              max="10"
              className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={input.maxAdults}
              onChange={(e) =>
                setInput({ ...input, maxAdults: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Children
            </label>
            <input
              type="number"
              min="0"
              max="10"
              className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={input.maxChildren}
              onChange={(e) =>
                setInput({ ...input, maxChildren: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Bed Configuration */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Bed Configuration
          </h3>
          <button
            type="button"
            onClick={handleAddBed}
            className="text-primary hover:text-indigo-600 text-sm font-medium"
          >
            + Add Another Bed
          </button>
        </div>

        {input.beds.map((bed, index) => (
          <div key={index} className="flex gap-4 mb-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bed Type {input.beds.length > 1 ? index + 1 : ""}
              </label>
              <Select
                options={bedTypes}
                value={bedTypes.find((opt) => opt.value === bed.type)}
                onChange={(option) =>
                  handleBedChange(index, "type", option.value)
                }
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Count
              </label>
              <input
                type="number"
                min="1"
                max="10"
                className="w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={bed.count}
                onChange={(e) =>
                  handleBedChange(index, "count", parseInt(e.target.value))
                }
              />
            </div>
            {input.beds.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveBed(index)}
                className="text-red-500 hover:text-red-700 p-2"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Room Description */}
      <div className="mt-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Room Description
        </label>
        <textarea
          placeholder="Describe the room features, view, and special amenities..."
          rows="4"
          className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          value={input.description}
          onChange={(e) => setInput({ ...input, description: e.target.value })}
        />
      </div>

      {/* Room Availability */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Rooms of This Type
          </label>
          <input
            type="number"
            min="1"
            className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            value={input.totalRooms}
            onChange={(e) => setInput({ ...input, totalRooms: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Rooms
          </label>
          <input
            type="number"
            min="0"
            max={input.totalRooms}
            className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            value={input.availableRooms}
            onChange={(e) =>
              setInput({ ...input, availableRooms: e.target.value })
            }
          />
        </div>
      </div>

      {/* Room Policies */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Room Policies
        </h3>
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-primary focus:ring-primary"
              checked={input.smoking}
              onChange={(e) =>
                setInput({ ...input, smoking: e.target.checked })
              }
            />
            Smoking Allowed
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-primary focus:ring-primary"
              checked={input.petsAllowed}
              onChange={(e) =>
                setInput({ ...input, petsAllowed: e.target.checked })
              }
            />
            Pets Allowed
          </label>
        </div>
      </div>

      {/* Amenities */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Amenities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.keys(input.amenities).map((amenity, index) => (
            <label
              key={index}
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
            >
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary focus:ring-primary"
                checked={input.amenities[amenity]}
                onChange={() =>
                  setInput({
                    ...input,
                    amenities: {
                      ...input.amenities,
                      [amenity]: !input.amenities[amenity],
                    },
                  })
                }
              />
              <span className="text-sm text-gray-700">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex gap-4">
        <button
          type="submit"
          disabled={loading || userHotels.length === 0}
          className="bg-primary text-white px-8 py-3 rounded-lg cursor-pointer hover:bg-indigo-600 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Adding Room...
            </>
          ) : (
            "Add Room"
          )}
        </button>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg cursor-pointer hover:bg-gray-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddRoom;
