import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import Title from "../../components/Title";
import assets from "../../assets/assets";

const Dashboard = ({ onShowHotelReg }) => {
  const { getToken } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    recentBookings: [],
    totalRooms: 0,
    occupancyRate: 0,
  });
  const [userHotels, setUserHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = await getToken();

        // Fetch user hotels
        const hotelsResponse = await fetch(
          "http://localhost:5000/api/hotels/owner/my-hotels",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (hotelsResponse.ok) {
          const hotelsResult = await hotelsResponse.json();
          if (hotelsResult.success) {
            setUserHotels(hotelsResult.data);

            // If user has hotels, fetch dashboard stats
            if (hotelsResult.data.length > 0) {
              await fetchDashboardStats(token, hotelsResult.data);
            } else {
              setLoading(false);
            }
          }
        } else {
          setError("Failed to load hotel data");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    };

    const fetchDashboardStats = async (token, hotels) => {
      try {
        // You'll need to create this endpoint in your backend
        const statsResponse = await fetch(
          "http://localhost:5000/api/owner/dashboard-stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (statsResponse.ok) {
          const statsResult = await statsResponse.json();
          if (statsResult.success) {
            setDashboardData(statsResult.data);
          }
        } else {
          // Fallback: Calculate basic stats from hotel data
          const basicStats = calculateBasicStats(hotels);
          setDashboardData(basicStats);
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        // Fallback to basic stats
        const basicStats = calculateBasicStats(hotels);
        setDashboardData(basicStats);
      } finally {
        setLoading(false);
      }
    };

    const calculateBasicStats = (hotels) => {
      // Basic calculations until you have proper endpoints
      const totalRooms = hotels.reduce(
        (sum, hotel) => sum + (hotel.totalRooms || 0),
        0
      );

      return {
        totalBookings: 0, // You'll need to implement this
        totalRevenue: 0, // You'll need to implement this
        recentBookings: [], // You'll need to implement this
        totalRooms,
        occupancyRate: 0,
      };
    };

    fetchDashboardData();
  }, [getToken]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
          <div className="flex gap-4 mb-8">
            <div className="h-24 bg-gray-200 rounded flex-1"></div>
            <div className="h-24 bg-gray-200 rounded flex-1"></div>
            <div className="h-24 bg-gray-200 rounded flex-1"></div>
          </div>
        </div>
      </div>
    );
  }

  const hasHotels = userHotels.length > 0;

  return (
    <div>
      <Title
        align="left"
        font="outfit"
        title="Dashboard"
        subTitle="Effortlessly monitor your room listings, track bookings, and analyze revenue—all from a single, intuitive platform. Stay informed with real-time insights to ensure seamless operations, optimize efficiency, and maximize profitability"
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Hotel Registration Prompt */}
      {!hasHotels && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Welcome to Hotel Owner Dashboard
              </h3>
              <p className="text-blue-600">
                Get started by registering your first hotel to manage rooms,
                bookings, and revenue.
              </p>
            </div>
            <button
              onClick={onShowHotelReg}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-all font-medium whitespace-nowrap"
            >
              Register Your First Hotel
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        {/* Total Bookings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <img
                src={assets.totalBookingIcon}
                alt="totalBookingIcon"
                className="h-8 w-8"
              />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-800">
                {dashboardData.totalBookings}
              </p>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <img
                src={assets.totalRevenueIcon}
                alt="totalRevenueIcon"
                className="h-8 w-8"
              />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">
                ₦ {dashboardData.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Total Rooms */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <img
                src={assets.totalRevenueIcon} // Replace with room icon
                alt="roomIcon"
                className="h-8 w-8"
              />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-800">
                {dashboardData.totalRooms}
              </p>
            </div>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg mr-4">
              <img
                src={assets.totalRevenueIcon} // Replace with occupancy icon
                alt="occupancyIcon"
                className="h-8 w-8"
              />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Occupancy Rate</p>
              <p className="text-2xl font-bold text-gray-800">
                {dashboardData.occupancyRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Hotel Button for users with existing hotels */}
      {hasHotels && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-blue-950/70 font-medium">
            Your Hotels: {userHotels.length}
          </h2>
          <button
            onClick={onShowHotelReg}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg transition-all font-medium flex items-center gap-2"
          >
            <span>+</span>
            Add Another Hotel
          </button>
        </div>
      )}

      {/* Hotel List */}
      {hasHotels && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userHotels.map((hotel, index) => (
              <div
                key={hotel._id || index}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">
                  {hotel.name}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  📍 {hotel.city}, {hotel.state}
                </p>
                <p className="text-sm text-gray-500 mb-2">📞 {hotel.phone}</p>
                <div className="flex justify-between items-center mt-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      hotel.isVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {hotel.isVerified ? "✅ Verified" : "⏳ Pending"}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      hotel.isActive
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {hotel.isActive ? "🟢 Active" : "🔴 Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookings Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl text-blue-950/70 font-medium">
            Recent Bookings
          </h2>
        </div>

        {dashboardData.recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Room
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentBookings.map((booking, index) => (
                  <tr key={booking._id || index} className="hover:bg-gray-50">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.guestName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.guestEmail}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900">
                        {booking.roomType}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.hotelName}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.checkInDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.nights} nights
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₦ {booking.totalAmount?.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {booking.status?.charAt(0).toUpperCase() +
                          booking.status?.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              {/* You can add an illustration icon here */}
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-gray-500 mb-2">No bookings yet</p>
            <p className="text-sm text-gray-400">
              Bookings will appear here once customers start making
              reservations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
