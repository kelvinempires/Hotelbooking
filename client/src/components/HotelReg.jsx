import React, { useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import assets, { cities } from "../assets/assets";

const HotelReg = ({ onClose, onSuccess }) => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    email: "",
    state: "Lagos",
    country: "Nigeria",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate required fields
      if (
        !formData.name ||
        !formData.phone ||
        !formData.address ||
        !formData.city
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Get Clerk session token
      const token = await getToken();
      console.log("🔑 Token received:", token ? "Yes" : "No");

      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }

      const hotelData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        email: formData.email || user?.primaryEmailAddress?.emailAddress,
      };

      console.log("📤 Sending hotel data:", hotelData);

      // Use relative URL or environment variable
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE_URL}/api/hotels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(hotelData),
      });

      const result = await response.json();
      console.log("📥 Response status:", response.status);
      console.log("📥 Response data:", result);

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      if (result.success) {
        onSuccess?.(result.data);
        onClose();
      } else {
        throw new Error(result.message || "Registration failed");
      }
    } catch (err) {
      console.error("❌ Hotel registration error:", err);
      setError(err.message || "Failed to register hotel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex top-0 bottom-0 left-0 right-0 z-50 fixed items-center justify-center bg-black/70">
      <form
        onSubmit={handleSubmit}
        className="flex bg-white rounded-xl max-w-4xl max-md:mx-2 w-full"
      >
        <img
          src={assets.regImage}
          alt="regImage"
          className="w-1/2 rounded-xl hidden md:block object-cover"
        />
        <div className="relative flex flex-col items-center md:w-1/2 p-8 md:p-10 w-full">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 h-6 w-6 cursor-pointer hover:bg-gray-100 rounded-full flex items-center justify-center"
          >
            <img src={assets.closeIcon} alt="closeIcon" className="h-3 w-3" />
          </button>

          <p className="font-semibold text-2xl mt-2 text-center">
            Register Your Hotel
          </p>

          {/* Error Message */}
          {error && (
            <div className="w-full mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Hotel Name */}
          <div className="w-full mt-4">
            <label htmlFor="name" className="font-medium text-gray-500">
              Hotel Name *
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter hotel name"
              value={formData.name}
              onChange={handleChange}
              className="border border-gray-300 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light"
              required
              disabled={loading}
            />
          </div>

          {/* Phone */}
          <div className="w-full mt-4">
            <label htmlFor="phone" className="font-medium text-gray-500">
              Phone Number *
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              className="border border-gray-300 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light"
              required
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="w-full mt-4">
            <label htmlFor="email" className="font-medium text-gray-500">
              Contact Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter contact email"
              value={formData.email}
              onChange={handleChange}
              className="border border-gray-300 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light"
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-1">
              {user?.primaryEmailAddress?.emailAddress
                ? `Your primary email: ${user.primaryEmailAddress.emailAddress} will be used if left empty`
                : "Please provide an email address"}
            </p>
          </div>

          {/* Address */}
          <div className="w-full mt-4">
            <label htmlFor="address" className="font-medium text-gray-500">
              Address *
            </label>
            <input
              id="address"
              type="text"
              placeholder="Enter full address"
              value={formData.address}
              onChange={handleChange}
              className="border border-gray-300 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light"
              required
              disabled={loading}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full mt-4">
            {/* City Dropdown */}
            <div className="w-full">
              <label htmlFor="city" className="font-medium text-gray-500">
                City *
              </label>
              <select
                id="city"
                value={formData.city}
                onChange={handleChange}
                className="border border-gray-300 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light"
                required
                disabled={loading}
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* State */}
            <div className="w-full">
              <label htmlFor="state" className="font-medium text-gray-500">
                State *
              </label>
              <input
                id="state"
                type="text"
                placeholder="Enter state"
                value={formData.state}
                onChange={handleChange}
                className="border border-gray-300 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-4 w-full mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 px-6 py-2.5 rounded cursor-pointer hover:bg-gray-50 transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 transition-all text-white px-6 py-2.5 rounded cursor-pointer flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Registering...
                </>
              ) : (
                "Register Hotel"
              )}
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-4 text-center">
            * Required fields. Your hotel will be reviewed before going live.
          </p>
        </div>
      </form>
    </div>
  );
};

export default HotelReg;
