import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import Title from "../components/Title";
import assets from "../assets/assets";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const MyBookings = () => {
  const { getToken, isSignedIn, userId } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);

  // Fetch bookings from protected endpoint
  const fetchBookings = async (p = 1) => {
    setLoading(true);
    setError(null);

    try {
      // if user is not signed in the token call will fail — guard early
      if (!isSignedIn) {
        setError("You must be signed in to view your bookings.");
        setBookings([]);
        setLoading(false);
        return;
      }

      const token = await getToken();

      const res = await axios.get(
        `${API}/api/bookings/my-bookings?page=${p}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success) {
        setBookings(res.data.data || []);
        setPage(res.data.pagination?.page || p);
        setPages(res.data.pagination?.pages || 1);
      } else {
        setError(res.data?.message || "Failed to fetch bookings");
      }
    } catch (err) {
      console.error("Fetch bookings error:", err);
      setError(
        err.response?.data?.message || err.message || "Error loading bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, userId]);

  const handlePayment = (bookingId) => {
    // Navigate to your payment flow — implement payment route separately
    navigate(`/payment/${bookingId}`);
  };

  const handleCancel = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const token = await getToken();
      const res = await axios.patch(
        `${API}/api/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        // optimistic update
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? res.data.data : b))
        );
      } else {
        alert(res.data?.message || "Unable to cancel booking");
      }
    } catch (err) {
      console.error("Cancel booking error:", err);
      alert(err.response?.data?.message || err.message || "Cancel failed");
    }
  };

  const goToPage = (p) => {
    if (p < 1 || p > pages) return;
    fetchBookings(p);
  };

  if (loading)
    return (
      <div className="py-28 px-4 md:px-16 lg:px-24 xl:px-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="My Bookings"
        subTitle="Manage all your hotel reservations in one place."
        align="left"
      />

      {error && (
        <div className="max-w-6xl mt-6 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="max-w-6xl mt-8 w-full text-gray-800">
        <div className="hidden md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3">
          <div>Hotel</div>
          <div>Date & Timings</div>
          <div>Payment</div>
        </div>

        {bookings.length === 0 ? (
          <div className="mt-8 text-center text-gray-600">
            You have no bookings yet.
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking._id}
              className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 py-6 first:border-t items-start"
            >
              {/* Hotel Details */}
              <div className="flex flex-col md:flex-row">
                <img
                  src={
                    booking.room?.images?.[0]?.url ||
                    booking.room?.images?.[0] ||
                    assets.placeholderImage
                  }
                  alt="hotel img"
                  className="w-40 h-28 object-cover rounded shadow"
                />

                <div className="flex flex-col gap-1.5 max-md:mt-3 md:ml-4">
                  <p className="font-playfair text-2xl">
                    <Link
                      to={`/hotel/${booking.hotel?._id || booking.hotel}`}
                      className="hover:underline"
                    >
                      {booking.hotel?.name || "Hotel"}
                    </Link>
                    <span className="text-sm font-inter">
                      {" "}
                      ({booking.room?.roomType || booking.room?.roomType})
                    </span>
                  </p>

                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <img src={assets.locationIcon} alt="locationIcon" />
                    <span>{booking.hotel?.address}</span>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <img src={assets.guestsIcon} alt="guestsIcon" />
                    <span>
                      Guest:{" "}
                      {booking.guests || booking.nights
                        ? booking.guests || booking.nights
                        : 1}
                    </span>
                  </div>

                  <p className="text-base font-semibold">
                    Total: ₦
                    {(
                      booking.totalAmount ||
                      booking.totalPrice ||
                      0
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex flex-row md:items-center md:gap-12 mt-3 gap-8">
                <div>
                  <p>Check-In:</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(booking.checkInDate).toDateString()}
                  </p>
                </div>
                <div>
                  <p>Check-Out:</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(booking.checkOutDate).toDateString()}
                  </p>
                </div>
              </div>

              {/* Payment */}
              <div className="flex flex-col items-start justify-center pt-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      booking.isPaid ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <p
                    className={`text-sm ${
                      booking.isPaid ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {booking.isPaid ? "Paid" : "Unpaid"}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  {!booking.isPaid && (
                    <button
                      onClick={() => handlePayment(booking._id)}
                      className="px-4 py-1.5 text-xs border border-gray-400 rounded-full hover:bg-gray-50 transition cursor-pointer"
                    >
                      Pay Now
                    </button>
                  )}

                  {booking.status !== "cancelled" && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="px-4 py-1.5 text-xs border border-red-400 rounded-full text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}

                  <Link
                    to={`/bookings/${booking._id}`}
                    className="px-4 py-1.5 text-xs border border-gray-400 rounded-full hover:bg-gray-50 transition"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center gap-3 justify-center mt-6">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border rounded"
            >
              Prev
            </button>
            <span>
              Page {page} of {pages}
            </span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === pages}
              className="px-3 py-1 border rounded"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
