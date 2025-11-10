// src/pages/AllRooms.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import assets, { facilityIcons } from "../assets/assets";
import StarRating from "../components/StarRating";

const API = import.meta.env.VITE_API_URL || "";
const DEFAULT_LIMIT = 10;

// Checkbox component
const CheckBox = ({ label, selected = false, onChange = () => {} }) => (
  <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
    <input
      type="checkbox"
      checked={selected}
      onChange={(e) => onChange(e.target.checked, label)}
      className="h-4 w-4"
    />
    <span className="font-light select-none">{label}</span>
  </label>
);

// Radio button component
const RadioButton = ({ label, selected = false, onChange = () => {} }) => (
  <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
    <input
      type="radio"
      name="sortOptions"
      checked={selected}
      onChange={() => onChange(label)}
      className="h-4 w-4"
    />
    <span className="font-light select-none">{label}</span>
  </label>
);

const AllRooms = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // UI state
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRooms, setTotalRooms] = useState(0);
  const [limit, setLimit] = useState(() => parseInt(searchParams.get("limit")) || DEFAULT_LIMIT);

  // Filters from URL
  const city = searchParams.get("city") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const guests = searchParams.get("guests") || "";
  const type = searchParams.get("type") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "";

  // Local filter state
  const [openFilters, setOpenFilters] = useState(false);
  const [roomTypes, setRoomTypes] = useState([]); // will fetch from backend
  const priceRange = [
    { label: "0 - 50,000", min: 0, max: 50000 },
    { label: "50,000 - 100,000", min: 50000, max: 100000 },
    { label: "100,000 - 200,000", min: 100000, max: 200000 },
    { label: "200,000 - 300,000", min: 200000, max: 300000 },
    { label: "300,000+", min: 300000, max: "" },
  ];
  const sortOptions = ["price Low to High", "price High to Low", "Newest First"];

  const [selectedTypes, setSelectedTypes] = useState(type ? type.split(",") : []);
  const [selectedPrice, setSelectedPrice] = useState(() => {
    if (minPrice || maxPrice) return { min: minPrice, max: maxPrice };
    return { min: "", max: "" };
  });
  const [selectedSort, setSelectedSort] = useState(sort || "");

  // Fetch available room types dynamically from backend
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const { data } = await axios.get(`${API}/api/rooms/types`);
        if (Array.isArray(data)) setRoomTypes(data);
        else setRoomTypes([]);
      } catch (err) {
        console.warn("Failed to fetch room types", err);
        setRoomTypes(["Single", "Double", "Luxury", "Family"]); // fallback
      }
    };
    fetchRoomTypes();
  }, []);

  // Sync selected filters to URL
  useEffect(() => {
    const params = new URLSearchParams(Object.fromEntries([...searchParams]));
    if (selectedTypes.length) params.set("type", selectedTypes.join(",")); else params.delete("type");
    if (selectedPrice.min) params.set("minPrice", selectedPrice.min); else params.delete("minPrice");
    if (selectedPrice.max) params.set("maxPrice", selectedPrice.max); else params.delete("maxPrice");
    if (selectedSort) params.set("sort", selectedSort); else params.delete("sort");
    params.set("page", "1");
    params.set("limit", String(limit));
    setSearchParams(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTypes, selectedPrice, selectedSort, limit]);

  // Fetch rooms from API whenever filters change
  useEffect(() => {
    const controller = new AbortController();
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const url = `${API}/api/rooms?${searchParams.toString()}`;
        const { data } = await axios.get(url, { signal: controller.signal });
        setRooms(Array.isArray(data.data) ? data.data : []);
        setTotalRooms(data.total || data.count || 0);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Error fetching rooms", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
    return () => controller.abort();
  }, [searchParams]);

  const handleToggleType = (checked, label) => {
    setSelectedTypes((prev) => {
      if (checked) return [...prev, label];
      return prev.filter((p) => p !== label);
    });
  };

  const handlePriceSelect = (range) => {
    setSelectedPrice({ min: range.min || "", max: range.max || "" });
  };

  const handleSortChange = (label) => {
    let sortParam = "";
    if (label === "price Low to High") sortParam = "priceAsc";
    if (label === "price High to Low") sortParam = "priceDesc";
    if (label === "Newest First") sortParam = "newest";
    setSelectedSort(sortParam);
  };

  const totalPages = Math.max(1, Math.ceil(totalRooms / limit));
  const gotoPage = (p) => {
    const params = new URLSearchParams(Object.fromEntries([...searchParams]));
    params.set("page", String(p));
    setSearchParams(params);
  };

  const handleRate = async (roomId, rating) => {
    setRooms((prev) =>
      prev.map((r) =>
        r._id === roomId
          ? {
              ...r,
              avgRating: r.avgRating
                ? Math.round(((r.avgRating * (r.totalReviews || 0) + rating) / ((r.totalReviews || 0) + 1)) * 10) / 10
                : rating,
              totalReviews: (r.totalReviews || 0) + 1,
            }
          : r
      )
    );

    try {
      await axios.post(`${API}/api/rooms/${roomId}/rate`, { rating });
    } catch (err) {
      console.warn("Rating API not implemented yet", err?.response?.status || err);
    }
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 gap-8">
      {/* MAIN LIST */}
      <div className="flex-1 max-w-3xl">
        <div className="flex flex-col items-start text-left mb-6">
          <h1 className="font-playfair text-4xl md:text-[40px]">Hotel Rooms</h1>
          <p className="text-sm md:text-base text-gray-500/90 mt-2 max-w-[720px]">
            Showing results for{" "}
            <span className="font-medium">{city || "All cities"}</span>
            {guests ? ` • ${guests} guest${guests > 1 ? "s" : ""}` : ""}.
          </p>
        </div>

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white rounded-lg p-4 shadow-sm"
              >
                <div className="h-44 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {!loading && rooms.length === 0 && (
          <div className="py-12">
            <p className="text-gray-600">
              No rooms found. Try adjusting filters or search in another city.
            </p>
          </div>
        )}

        {!loading &&
          rooms.map((room) => (
            <div
              key={room._id}
              className="flex flex-col md:flex-row items-start py-8 gap-6 border-b border-gray-200 last:border-0"
            >
              <img
                onClick={() => {
                  navigate(`/rooms/${room._id}`);
                  window.scrollTo(0, 0);
                }}
                src={room.images?.[0]?.url || assets.placeholderImage}
                alt={room.hotel?.name || "room"}
                title="View Room Details"
                className="max-h-64 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer"
              />
              <div className="md:w-1/2 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">{room.hotel?.city}</p>
                    <p
                      onClick={() => {
                        navigate(`/rooms/${room._id}`);
                        window.scrollTo(0, 0);
                      }}
                      className="text-gray-800 text-2xl md:text-3xl font-playfair cursor-pointer"
                    >
                      {room.hotel?.name}
                    </p>
                    <div className="flex items-center mt-2 gap-3">
                      <StarRating
                        roomId={room._id}
                        value={room.avgRating || 0}
                        totalReviews={room.totalReviews || 0}
                        userRating={room.userRating || 0}
                        onRate={handleRate}
                        size={18}
                        readOnly={false}
                      />
                      <p className="ml-2 text-sm text-gray-500">
                        {room.totalReviews || 0} reviews
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-medium">
                      ₦
                      {(
                        room.finalPrice ||
                        room.pricePerNight ||
                        0
                      ).toLocaleString()}
                      {room.hasDiscount && (
                        <span className="ml-2 text-sm text-red-500 line-through">
                          ₦{(room.pricePerNight || 0).toLocaleString()}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">/night</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-gray-500 mt-2 text-sm">
                  <img
                    src={assets.locationIcon}
                    alt="locationIcon"
                    className="h-4"
                  />
                  <span>{room.hotel?.address}</span>
                </div>

                <div className="flex flex-wrap items-center mt-3 mb-6 gap-3">
                  {(room.amenities || []).slice(0, 6).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5FF]/70"
                    >
                      <img
                        src={facilityIcons[item]}
                        alt={item}
                        className="w-5 h-5"
                      />
                      <p className="text-sm">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => navigate(`/rooms/${room._id}`)}
                    className="px-4 py-2 rounded-md bg-primary text-white hover:shadow-md transition"
                  >
                    View
                  </button>
                  <button
                    onClick={() => {
                      navigate(`/rooms/${room._id}`);
                      window.scrollTo(0, 0);
                    }}
                    className="px-3 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50 transition"
                  >
                    Book
                  </button>
                </div>
              </div>
            </div>
          ))}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => gotoPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1;
              return (
                <button
                  key={p}
                  onClick={() => gotoPage(p)}
                  className={`px-3 py-1 rounded ${
                    p === page ? "bg-gray-900 text-white" : "border"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => gotoPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* FILTERS */}
      <aside className="w-80 bg-white border border-gray-300 text-gray-700 p-4 rounded">
        <div className="flex items-center justify-between">
          <p className="text-base font-medium text-gray-800">FILTERS</p>
          <div>
            <button
              onClick={() => {
                setSelectedTypes([]);
                setSelectedPrice({ min: "", max: "" });
                setSelectedSort("");
                const params = new URLSearchParams([...searchParams]);
                params.delete("city");
                params.delete("guests");
                params.set("page", "1");
                setSearchParams(params);
              }}
              className="text-xs hidden lg:inline"
            >
              CLEAR
            </button>
            <button
              className="lg:hidden text-xs"
              onClick={() => setOpenFilters((s) => !s)}
            >
              {openFilters ? "HIDE" : "SHOW"}
            </button>
          </div>
        </div>

        <div className={`${openFilters ? "block" : "lg:block"} mt-4`}>
          {/* CITY FILTER */}
          <div className="pb-4 border-b border-gray-100">
            <p className="font-medium text-gray-800 pb-2">City</p>
            <input
              type="text"
              value={city}
              onChange={(e) => {
                const params = new URLSearchParams([...searchParams]);
                const val = e.target.value;
                if (val) params.set("city", val);
                else params.delete("city");
                params.set("page", "1");
                setSearchParams(params);
              }}
              placeholder="Enter city"
              className="border rounded px-2 py-1 w-full text-sm"
            />
          </div>

          {/* GUESTS FILTER */}
          <div className="pt-4 pb-4 border-b border-gray-100">
            <p className="font-medium text-gray-800 pb-2">Guests</p>
            <input
              type="number"
              value={guests}
              min={1}
              onChange={(e) => {
                const params = new URLSearchParams([...searchParams]);
                const val = e.target.value;
                if (val) params.set("guests", val);
                else params.delete("guests");
                params.set("page", "1");
                setSearchParams(params);
              }}
              className="border rounded px-2 py-1 w-full text-sm"
            />
          </div>

          {/* ROOM TYPE FILTER */}
          <div className="pt-4 pb-4 border-b border-gray-100">
            <p className="font-medium text-gray-800 pb-2">Room Type</p>
            {roomTypes.map((t, i) => (
              <CheckBox
                key={i}
                label={t}
                selected={selectedTypes.includes(t)}
                onChange={handleToggleType}
              />
            ))}
          </div>

          {/* PRICE RANGE FILTER */}
          <div className="pt-4 pb-4 border-b border-gray-100">
            <p className="font-medium text-gray-800 pb-2">Price Range</p>
            {priceRange.map((r, i) => (
              <div key={i} className="mb-1">
                <button
                  onClick={() => handlePriceSelect(r)}
                  className={`text-sm text-left w-full py-2 ${
                    selectedPrice.min == r.min && selectedPrice.max == r.max
                      ? "font-semibold"
                      : "font-light"
                  }`}
                >
                  ₦ {r.label}
                </button>
              </div>
            ))}
          </div>

          {/* SORT FILTER */}
          <div className="pt-4 pb-4">
            <p className="font-medium text-gray-800 pb-2">Sort By</p>
            {sortOptions.map((o, i) => (
              <RadioButton
                key={i}
                label={o}
                selected={
                  selectedSort &&
                  (selectedSort.includes("price")
                    ? o.includes("Low")
                      ? selectedSort === "priceAsc"
                      : selectedSort === "priceDesc"
                    : selectedSort === "newest")
                }
                onChange={handleSortChange}
              />
            ))}
          </div>

          {/* RESULTS PER PAGE */}
          <div className="pt-4">
            <p className="font-medium text-gray-800 pb-2">Results per page</p>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="border rounded px-2 py-1 w-full text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default AllRooms;
