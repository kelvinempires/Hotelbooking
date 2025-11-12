// src/pages/RoomDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import assets, { facilityIcons, roomCommonData } from "../assets/assets";
import StarRating from "../components/StarRating";
import { useAuth, useUser } from "@clerk/clerk-react";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();

  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [booking, setBooking] = useState(false);

  // Fetch room details
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/rooms/${id}`
        );

        if (res.data && res.data.success && res.data.data) {
          setRoom(res.data.data);
          setMainImage(res.data.data.images?.[0]?.url || null);
        } else {
          setError(res.data?.message || "Unexpected response format");
        }
      } catch (err) {
        if (err.response?.status === 404) setError("Room not found");
        else if (err.response?.status === 500)
          setError("Server error. Please try again later.");
        else
          setError(
            err.response?.data?.message || err.message || "Failed to fetch room"
          );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRoom();
    else {
      setError("No room ID provided");
      setLoading(false);
    }
  }, [id]);

  // Helper: compute nights between checkIn and checkOut (integer)
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    try {
      const inDate = new Date(checkIn + "T00:00:00");
      const outDate = new Date(checkOut + "T00:00:00");
      const diff = outDate.getTime() - inDate.getTime();
      if (isNaN(diff) || diff <= 0) return 0;
      return Math.round(diff / MS_PER_DAY);
    } catch {
      return 0;
    }
  }, [checkIn, checkOut]);

  // Client-side calculated price (considers discount shown on the room object)
  const clientTotalPrice = useMemo(() => {
    if (!room || nights <= 0) return 0;
    // use discountedPrice if present in room else pricePerNight
    const unit = room.discountedPrice ?? room.pricePerNight ?? 0;
    return Math.round(unit * nights);
  }, [room, nights]);

  // Clear previous availability result when user edits dates/guests
  useEffect(() => {
    setAvailabilityResult(null);
  }, [checkIn, checkOut, guests]);

  // Handle Availability Check (server validation)
  const handleCheckAvailability = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!checkIn || !checkOut) {
      setAvailabilityResult({ error: "Select check-in and check-out dates" });
      return;
    }
    if (nights <= 0) {
      setAvailabilityResult({ error: "Check-out must be after check-in" });
      return;
    }
    if (Number(guests) < 1) {
      setAvailabilityResult({ error: "Guests must be at least 1" });
      return;
    }
    if (Number(guests) > (room?.maxGuests ?? 1000)) {
      setAvailabilityResult({
        error: `Max guests for this room: ${room?.maxGuests ?? "N/A"}`,
      });
      return;
    }

    setChecking(true);
    setAvailabilityResult(null);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/rooms/${id}/check-availability`,
        { checkIn, checkOut, guests: Number(guests) }
      );

      if (res.data?.success) {
        // prefer server-calculated totals but also include client totals for fallback
        setAvailabilityResult({
          ...res.data.data,
          totalPrice:
            res.data.data.totalPrice ?? clientTotalPrice ?? res.data.data.total,
        });
      } else {
        setAvailabilityResult({
          error: res.data?.message || "Room not available",
        });
      }
    } catch (err) {
      setAvailabilityResult({
        error:
          err.response?.data?.message ||
          err.message ||
          "Availability check failed",
      });
    } finally {
      setChecking(false);
    }
  };

  // Handle Booking (authenticated - uses Clerk token)
  const handleBooking = async () => {
    // Must have availability result (server validated) and dates set
    if (!availabilityResult || !availabilityResult.nights) {
      alert("Please check availability first.");
      return;
    }

    setBooking(true);

    try {
      const token = await getToken();

      const payload = {
        room: id,
        hotel: room?.hotel?._id,
        guestName:
          `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Guest",
        guestEmail: user?.primaryEmailAddress?.emailAddress,
        guestPhone: user?.phoneNumber || "",
        checkInDate: checkIn,
        checkOutDate: checkOut,
        nights: availabilityResult.nights,
        totalAmount: availabilityResult.totalPrice ?? clientTotalPrice,
        specialRequests: specialRequests.trim(),
        paymentMethod: "card",
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bookings`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        // redirect to my-bookings and optionally show toast
        navigate("/my-bookings");
      } else {
        alert(res.data?.message || "Booking failed");
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading room details...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Room
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dull transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  // destructure safely
  const {
    hotel = {},
    roomType = "Unknown Room Type",
    images = [],
    amenities = [],
    pricePerNight = 0,
    discountedPrice,
    avgRating = 0,
    totalReviews = 0,
    reviews = [],
    discount,
    description = "No description available.",
    hasDiscount = false,
    maxGuests = 1,
  } = room ?? {};

  const displayPrice = discountedPrice ?? pricePerNight;
  const currentDiscount = discount || {};
  const currentHasDiscount = hasDiscount || currentDiscount.amount > 0;

  return (
    <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">
      {/* Header & Rating */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
        <h1 className="text-3xl md:text-4xl font-playfair">
          {hotel.name || "Unknown Hotel"}{" "}
          <span className="font-inter text-sm">({roomType})</span>
        </h1>
        {currentHasDiscount && (
          <p className="text-sm font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full">
            {currentDiscount.type === "percentage"
              ? `${currentDiscount.amount}% OFF`
              : `₦${currentDiscount.amount} OFF`}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 mt-2">
        <StarRating rating={avgRating} />
        <p className="text-gray-600">
          {totalReviews} review{totalReviews !== 1 && "s"}
        </p>
      </div>

      {/* Address & Images */}
      {hotel.address && (
        <div className="flex items-center gap-1 text-gray-500 mt-2">
          <img src={assets.locationIcon} alt="location" className="w-4 h-4" />
          <span>{hotel.address}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row mt-6 gap-6">
        <div className="lg:w-1/2 w-full">
          {mainImage ? (
            <img
              src={mainImage}
              alt="room"
              className="w-full h-96 rounded-xl shadow-lg object-cover"
            />
          ) : (
            <div className="w-full h-96 rounded-xl shadow-lg bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Image Available</span>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={`Room ${idx + 1}`}
                className={`w-full h-48 rounded-xl shadow-md object-cover cursor-pointer ${
                  mainImage === img.url ? "ring-2 ring-orange-500" : ""
                }`}
                onClick={() => setMainImage(img.url)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Amenities & Price */}
      <div className="flex flex-col md:flex-row md:justify-between mt-10">
        <div className="flex flex-col md:w-2/3">
          <h1 className="text-3xl md:text-4xl font-playfair mb-4">
            Indulge in luxury like never before.
          </h1>

          {amenities.length > 0 ? (
            <div className="flex flex-wrap items-center mt-3 mb-6 gap-4">
              {amenities.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100"
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
          ) : (
            <p className="text-gray-500 mt-3 mb-6">No amenities listed</p>
          )}
        </div>

        <div className="flex items-center gap-2 md:w-1/3 justify-end">
          {currentHasDiscount && (
            <p className="text-lg text-gray-500 line-through">
              ₦{pricePerNight.toLocaleString()}
            </p>
          )}
          <p className="text-2xl font-medium">
            ₦{displayPrice.toLocaleString()}/night
          </p>
        </div>
      </div>

      {/* Availability & Booking panel */}
      <form
        onSubmit={handleCheckAvailability}
        className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-md p-6 rounded-xl mx-auto mt-16 max-w-6xl gap-4"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500">
          <div className="flex flex-col">
            <label htmlFor="checkInDate" className="font-medium">
              Check in
            </label>
            <input
              type="date"
              id="checkInDate"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="checkOutDate" className="font-medium">
              Check Out
            </label>
            <input
              type="date"
              id="checkOutDate"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="guest" className="font-medium">
              Guest
            </label>
            <input
              type="number"
              id="guest"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              min={1}
              max={maxGuests}
              className="max-w-20 rounded border border-gray-300 px-3 mt-1.5 outline-none"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Max {maxGuests} guests</p>
          </div>

          <div className="flex flex-col w-full md:w-auto">
            <label htmlFor="specialRequests" className="font-medium">
              Special Requests
            </label>
            <textarea
              id="specialRequests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requests?"
              className="rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none w-full md:w-60"
            />
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          {/* Instant client-side price preview */}
          <div className="text-right">
            {nights <= 0 ? (
              <p className="text-sm text-gray-500">
                Select dates to see total price
              </p>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  {nights} night{nights > 1 ? "s" : ""} • ₦
                  {displayPrice.toLocaleString()} / night
                </p>
                <p className="text-xl font-semibold">
                  Total: ₦{clientTotalPrice.toLocaleString()}
                </p>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={checking}
            className="bg-primary hover:bg-primary-dull transition-all text-white rounded-md px-6 py-3 md:py-4 cursor-pointer"
          >
            {checking ? "Checking..." : "Check Availability"}
          </button>
        </div>
      </form>

      {/* Availability Result (server) */}
      <div className="max-w-6xl mx-auto mt-4">
        {availabilityResult?.error && (
          <div className="p-4 bg-red-100 text-red-700 rounded">
            {availabilityResult.error}
          </div>
        )}

        {availabilityResult && !availabilityResult.error && (
          <div className="p-4 bg-green-100 text-green-700 rounded flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p>
                Room available for <strong>{availabilityResult.nights}</strong>{" "}
                night{availabilityResult.nights > 1 && "s"}.
              </p>
              <p>
                Total Price:{" "}
                <strong>
                  ₦
                  {(
                    availabilityResult.totalPrice ?? clientTotalPrice
                  ).toLocaleString()}
                </strong>
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="px-4 py-2 border rounded"
              >
                Edit
              </button>
              <button
                onClick={handleBooking}
                disabled={booking}
                className="px-4 py-2 bg-primary text-white rounded"
              >
                {booking ? "Booking..." : "Book Now"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Common Specs */}
      <div className="mt-25 space-y-4">
        {roomCommonData.map((spec, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <img src={spec.icon} alt={`${spec.title}-icon`} className="w-6.5" />
            <div>
              <p className="text-base">{spec.title}</p>
              <p className="text-gray-500">{spec.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Description */}
      <p className="max-w-3xl border-y border-gray-300 py-10 my-15 text-gray-500">
        {description}
      </p>

      {/* Host Info */}
      <div className="flex flex-col items-start gap-4">
        <div className="flex gap-4">
          <img
            src={hotel.owner?.image}
            alt="host"
            className="h-14 w-14 md:h-18 md:w-18 rounded-full"
          />
          <div>
            <p className="text-lg md:text-xl">
              Hosted By {hotel.owner?.name || hotel.name}
            </p>
            <div className="flex items-center mt-1">
              <StarRating rating={avgRating} />
              <p className="ml-2">
                {totalReviews} review{totalReviews !== 1 && "s"}
              </p>
            </div>
          </div>
        </div>

        <button className="px-6 py-2.5 mt-4 rounded text-white bg-primary transition-all cursor-pointer hover:shadow-lg active:shadow-none hover:scale-95">
          Contact Now
        </button>
      </div>

      {/* Reviews */}
      <div className="mt-16 max-w-4xl">
        <h2 className="text-2xl font-semibold mb-4">Guest Reviews</h2>
        {reviews.length > 0 ? (
          reviews.map((review, idx) => (
            <div key={idx} className="border-b border-gray-200 py-4">
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {review.user?.name || "Anonymous"}
                </p>
                <StarRating rating={review.rating} />
              </div>
              <p className="text-gray-500 mt-1">{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}
      </div>
    </div>
  );
};

export default RoomDetails;
