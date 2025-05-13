import React, { useState, useRef } from "react";
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
      { value: "Double Bed", label: "🛏️🛏️ Double Bed - Perfect for couples"  },
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

const AddRoom = () => {
  const fileInputRef = useRef();
  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [input, setInput] = useState({
    roomType: null,
    pricePerNight: 0,
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
    },
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(
      (file) => file.size <= MAX_SIZE_MB * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      alert("One or more files exceed the 2MB size limit.");
    }

    if (images.length + validFiles.length > MAX_IMAGES) {
      alert(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    setImages([...images, ...validFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(
      (file) => file.size <= MAX_SIZE_MB * 1024 * 1024
    );

    if (validFiles.length !== droppedFiles.length) {
      alert("Some files are too large (2MB max).");
    }

    if (images.length + validFiles.length > MAX_IMAGES) {
      alert(`You can upload up to ${MAX_IMAGES} images total.`);
      return;
    }

    setImages([...images, ...validFiles]);
  };

  const handleRemoveImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  return (
    <form>
      <Title
        align="left"
        font="outfit"
        title="Add Room"
        subTitle="Fill in the details carefully to ensure a great booking experience."
      />

      {/* Image Upload */}
      <p className="text-gray-800 mt-10">Images</p>
      <div
        onClick={() => fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border border-dashed border-gray-400 p-4 rounded-md text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition mb-4"
      >
        <p className="text-sm text-gray-600">
          Click or drag & drop images here (Max 10 images, 2MB each)
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <div key={index} className="relative group">
            <img
              src={URL.createObjectURL(img)}
              alt={`Preview ${index}`}
              className="h-32 w-full object-cover rounded shadow cursor-pointer"
              onClick={() => setPreviewImage(URL.createObjectURL(img))}
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute top-1 right-1 bg-white text-red-500 rounded-full text-xs px-2 py-0.5 shadow hover:bg-red-500 hover:text-white transition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] rounded shadow-lg"
          />
        </div>
      )}

      {/* Room Type & Price */}
      <div className="grid md:grid-cols-2 gap-6 mt-6 bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Type
          </label>
          <Select
            options={roomTypes}
            value={input.roomType}
            onChange={(option) => setInput({ ...input, roomType: option })}
            placeholder="Select Room Type..."
            className="react-select-container text-sm text-gray-800"
            classNamePrefix="react-select"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price <span className="text-xs text-gray-500">/night</span>
          </label>
          <input
            type="number"
            placeholder="e.g. 120"
            className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            value={input.pricePerNight}
            onChange={(e) =>
              setInput({ ...input, pricePerNight: e.target.value })
            }
          />
        </div>
      </div>

      {/* Amenities */}
      <div className="mt-8">
        <p className="text-gray-800 font-semibold mb-3">Amenities</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-gray-600">
          {Object.keys(input.amenities).map((amenity, index) => (
            <label key={index} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-primary w-4 h-4"
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
              {amenity}
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="bg-primary text-white px-8 py-2 rounded mt-8 cursor-pointer hover:bg-indigo-600 transition shadow-md hover:shadow-lg active:scale-95"
      >
        Add room
      </button>
    </form>
  );
};

export default AddRoom;
