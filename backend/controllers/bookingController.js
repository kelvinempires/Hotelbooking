import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";

// Get public booking (limited information)
export const getPublicBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("room", "roomNumber roomType images")
      .populate("hotel", "name city address");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Return only public information
    const publicBooking = {
      _id: booking._id,
      guestName: booking.guestName,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      nights: booking.nights,
      totalAmount: booking.totalAmount,
      status: booking.status,
      isPaid: booking.isPaid,
      room: booking.room,
      hotel: booking.hotel,
      createdAt: booking.createdAt,
    };

    res.status(200).json({
      success: true,
      data: publicBooking,
    });
  } catch (error) {
    console.error("Get public booking error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Create Booking (fixed for Clerk + optional fields)
export const createBooking = async (req, res) => {
  try {
    const {
      room: roomId,
      hotel: hotelId,
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      nights,
      totalPrice, // ✅ match your model,
      guests,
      specialRequests,
      paymentMethod,
      userId, // ✅ from frontend (Clerk user ID)
    } = req.body;

    // Validate required fields (guestPhone is optional)
    if (
      !roomId ||
      !hotelId ||
      !guestName ||
      !guestEmail ||
      !checkInDate ||
      !checkOutDate ||
      !nights ||
      !totalPrice ||
      !guests
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required booking information",
      });
    }

    // ✅ Confirm room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // ✅ Attach user info safely
    const bookingData = {
      room: roomId,
      hotel: hotelId,
      guestName,
      guestEmail,
      guestPhone: guestPhone || "", // allow empty
      checkInDate,
      checkOutDate,
      nights,
      totalPrice,
      guests,
      specialRequests: specialRequests?.trim() || "",
      paymentMethod: paymentMethod || "pay-on-arrival",
      user: userId || req.auth?.user?.id || req.auth?.userId || null, // ✅ handles Clerk or manual user ID
    };

    const booking = await Booking.create(bookingData);

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (err) {
    console.error("Create booking error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Get current user's bookings
export const getMyBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Get user email from Clerk auth
    const guestEmail = req.auth.user.primaryEmailAddress.emailAddress;

    const filter = { guestEmail };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate("room hotel")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get my bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all bookings (Admin only)
export const getBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      guestEmail,
      hotel,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (guestEmail) filter.guestEmail = guestEmail;
    if (hotel) filter.hotel = hotel;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const bookings = await Booking.find(filter)
      .populate("room hotel")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get single booking by ID (Protected)
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id).populate("room hotel");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Get user email from Clerk auth
    const userEmail = req.auth.user.primaryEmailAddress.emailAddress;

    // Check if user has permission to view this booking
    // Users can only view their own bookings unless they're admin
    if (booking.guestEmail !== userEmail) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Get booking by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update booking (Admin only)
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove immutable fields
    delete updates._id;
    delete updates.hotel;
    delete updates.room;
    delete updates.guestEmail;

    const booking = await Booking.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("room hotel");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete booking (Admin only)
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get bookings by guest email (Admin only)
export const getBookingsByGuest = async (req, res) => {
  try {
    const { email } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { guestEmail: email };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate("room hotel")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get bookings by guest error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update booking payment status (Admin only)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPaid, paymentMethod } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        isPaid,
        paymentMethod: isPaid ? paymentMethod : undefined,
        status: isPaid ? "confirmed" : "pending",
      },
      { new: true, runValidators: true }
    ).populate("room hotel");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${isPaid ? "paid" : "unpaid"}`,
      data: booking,
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Cancel booking - User can cancel their own bookings
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Get user email from Clerk auth
    const userEmail = req.auth.user.primaryEmailAddress.emailAddress;

    // Check if user has permission to cancel this booking
    if (booking.guestEmail !== userEmail) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    // Check if booking can be cancelled (e.g., not too close to check-in)
    const checkIn = new Date(booking.checkInDate);
    const now = new Date();
    const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < 24) {
      return res.status(400).json({
        success: false,
        message:
          "Bookings can only be cancelled at least 24 hours before check-in",
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    ).populate("room hotel");

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get booking statistics (for admin dashboard) - Admin only
export const getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const confirmedBookings = await Booking.countDocuments({
      status: "confirmed",
    });
    const cancelledBookings = await Booking.countDocuments({
      status: "cancelled",
    });
    const completedBookings = await Booking.countDocuments({
      status: "completed",
    });

    const totalRevenue = await Booking.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const revenueByMonth = await Booking.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalBookings,
        byStatus: {
          pending: pendingBookings,
          confirmed: confirmedBookings,
          cancelled: cancelledBookings,
          completed: completedBookings,
        },
        totalRevenue: totalRevenue[0]?.total || 0,
        revenueByMonth,
      },
    });
  } catch (error) {
    console.error("Get booking stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
