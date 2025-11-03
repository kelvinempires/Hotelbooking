// controllers/dashboardController.js
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

export const getDashboardStats = async (req, res) => {
  try {
    const { userId } = req.auth;

    // Get user's hotels
    const userHotels = await Hotel.find({ ownerId: userId, isActive: true });
    const hotelIds = userHotels.map((hotel) => hotel._id);

    // Get total bookings
    const totalBookings = await Booking.countDocuments({
      hotel: { $in: hotelIds },
      status: { $in: ["confirmed", "completed"] },
    });

    // Get total revenue
    const revenueResult = await Booking.aggregate([
      {
        $match: {
          hotel: { $in: hotelIds },
          status: { $in: ["confirmed", "completed"] },
          isPaid: true,
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Get recent bookings
    const recentBookings = await Booking.find({
      hotel: { $in: hotelIds },
    })
      .populate("hotel", "name")
      .populate("room", "roomType")
      .sort({ createdAt: -1 })
      .limit(10)
      .select("guestName guestEmail checkInDate nights totalAmount status");

    // Get total rooms
    const totalRooms = await Room.countDocuments({
      hotel: { $in: hotelIds },
      isAvailable: true,
    });

    // Calculate occupancy rate (this is a simplified version)
    const totalBookedRooms = await Booking.countDocuments({
      hotel: { $in: hotelIds },
      status: "confirmed",
      checkInDate: { $lte: new Date() },
      checkOutDate: { $gte: new Date() },
    });

    const occupancyRate =
      totalRooms > 0 ? Math.round((totalBookedRooms / totalRooms) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalBookings,
        totalRevenue: revenueResult[0]?.totalRevenue || 0,
        recentBookings,
        totalRooms,
        occupancyRate,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
    });
  }
};
