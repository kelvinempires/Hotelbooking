import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import Testimonial from "../models/Testimonial.js";
import mongoose from "mongoose";



// @desc    Get rooms by hotel with availability, ratings, and discounts
// @route   GET /api/rooms/hotel/:hotelId
// @access  Public
export const getRoomsByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const {
      checkIn,
      checkOut,
      guests,
      roomType,
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;

    // Verify hotel exists and is active
    const hotel = await Hotel.findOne({ _id: hotelId, isActive: true });
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    const filter = {
      hotel: hotelId,
      isAvailable: true,
      availableRooms: { $gt: 0 },
    };

    if (roomType) filter.roomType = { $regex: roomType, $options: "i" };
    if (guests) filter.maxGuests = { $gte: parseInt(guests) };

    // Sorting
    let sortOption = { createdAt: -1 }; // default = newest
    if (sort === "priceAsc") sortOption = { pricePerNight: 1 };
    if (sort === "priceDesc") sortOption = { pricePerNight: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Aggregation pipeline
    const roomsAggregate = await Room.aggregate([
      { $match: filter },
      // Lookup hotel info
      {
        $lookup: {
          from: "hotels",
          localField: "hotel",
          foreignField: "_id",
          as: "hotel",
        },
      },
      { $unwind: "$hotel" },
      // Lookup testimonials for this room
      {
        $lookup: {
          from: "testimonials",
          let: { roomId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$room", "$$roomId"] },
                isApproved: true,
              },
            },
            {
              $group: {
                _id: "$room",
                avgRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 },
              },
            },
          ],
          as: "reviews",
        },
      },
      {
        $addFields: {
          avgRating: {
            $ifNull: [{ $arrayElemAt: ["$reviews.avgRating", 0] }, 0],
          },
          totalReviews: {
            $ifNull: [{ $arrayElemAt: ["$reviews.totalReviews", 0] }, 0],
          },
          finalPrice: {
            $cond: [
              { $gt: ["$discount.amount", 0] },
              {
                $cond: [
                  { $eq: ["$discount.type", "percentage"] },
                  {
                    $multiply: [
                      "$pricePerNight",
                      {
                        $subtract: [1, { $divide: ["$discount.amount", 100] }],
                      },
                    ],
                  },
                  {
                    $max: [
                      0,
                      { $subtract: ["$pricePerNight", "$discount.amount"] },
                    ],
                  },
                ],
              },
              "$pricePerNight",
            ],
          },
          hasDiscount: { $gt: ["$discount.amount", 0] },
        },
      },
      { $project: { reviews: 0, __v: 0 } },
      { $sort: sortOption },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    const total = await Room.countDocuments(filter);

    res.json({
      success: true,
      count: roomsAggregate.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: roomsAggregate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching rooms",
      error: error.message,
    });
  }
};

// @desc    Get all rooms with filters, sorting, pagination, and ratings
// @route   GET /api/rooms
// @access  Public
export const getRooms = async (req, res) => {
  try {
    const {
      hotel,
      roomType,
      minPrice,
      maxPrice,
      amenities,
      guests,
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { isAvailable: true };

    if (hotel) filter.hotel = hotel;
    if (roomType) filter.roomType = { $regex: roomType, $options: "i" };
    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = parseInt(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = parseInt(maxPrice);
    }
    if (amenities) filter.amenities = { $in: amenities.split(",") };
    if (guests) filter.maxGuests = { $gte: parseInt(guests) };

    // Sorting
    let sortOption = { createdAt: -1 }; // default = newest
    if (sort === "priceAsc") sortOption = { pricePerNight: 1 };
    if (sort === "priceDesc") sortOption = { pricePerNight: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Aggregation pipeline
    const roomsAggregate = await Room.aggregate([
      { $match: filter },
      // Lookup hotel info
      {
        $lookup: {
          from: "hotels",
          localField: "hotel",
          foreignField: "_id",
          as: "hotel",
        },
      },
      { $unwind: "$hotel" },
      // Lookup testimonials
      {
        $lookup: {
          from: "testimonials",
          let: { roomId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$room", "$$roomId"] },
                isApproved: true,
              },
            },
            {
              $group: {
                _id: "$room",
                avgRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 },
              },
            },
          ],
          as: "reviews",
        },
      },
      {
        $addFields: {
          avgRating: {
            $ifNull: [{ $arrayElemAt: ["$reviews.avgRating", 0] }, 0],
          },
          totalReviews: {
            $ifNull: [{ $arrayElemAt: ["$reviews.totalReviews", 0] }, 0],
          },
          finalPrice: {
            $cond: [
              { $gt: ["$discount.amount", 0] },
              {
                $cond: [
                  { $eq: ["$discount.type", "percentage"] },
                  {
                    $multiply: [
                      "$pricePerNight",
                      {
                        $subtract: [1, { $divide: ["$discount.amount", 100] }],
                      },
                    ],
                  },
                  {
                    $max: [
                      0,
                      { $subtract: ["$pricePerNight", "$discount.amount"] },
                    ],
                  },
                ],
              },
              "$pricePerNight",
            ],
          },
          hasDiscount: { $gt: ["$discount.amount", 0] },
        },
      },
      // Remove internal fields
      { $project: { reviews: 0, __v: 0 } },
      { $sort: sortOption },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    const total = await Room.countDocuments(filter);

    res.json({
      success: true,
      count: roomsAggregate.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: roomsAggregate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching rooms",
      error: error.message,
    });
  }
};


// Create room for hotel (owner only)
// @route   POST /api/rooms
// @access  Private/Owner
export const createRoom = async (req, res) => {
  try {
    const { auth } = req;
    const { hotel } = req.body;

    // Verify hotel exists and user is owner
    const hotelDoc = await Hotel.findOne({ _id: hotel, isActive: true });
    if (!hotelDoc) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    if (hotelDoc.ownerId !== auth.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add rooms to this hotel",
      });
    }

    const room = new Room(req.body);
    await room.save();
    await room.populate("hotel");

    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update room (owner only)
// @route   PUT /api/rooms/:id
// @access  Private/Owner
export const updateRoom = async (req, res) => {
  try {
    const { auth } = req;
    const room = await Room.findById(req.params.id).populate("hotel");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (room.hotel.ownerId !== auth.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this room",
      });
    }

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("hotel");

    res.json({
      success: true,
      data: updatedRoom,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get rooms by owner
// @route   GET /api/rooms/hotel/:hotelId
// @access  Public
export const getMyRooms = async (req, res) => {
  try {
    const { auth } = req;
    const { page = 1, limit = 10, hotelId } = req.query;

    const query = {};

    // If hotelId is provided, verify ownership
    if (hotelId) {
      const hotel = await Hotel.findOne({ _id: hotelId, ownerId: auth.userId });
      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: "Hotel not found or not owned by you",
        });
      }
      query.hotel = hotelId;
    } else {
      // Get all hotels owned by user, then get rooms for those hotels
      const myHotels = await Hotel.find({ ownerId: auth.userId });
      const hotelIds = myHotels.map((hotel) => hotel._id);
      query.hotel = { $in: hotelIds };
    }

    const rooms = await Room.find(query)
      .populate("hotel")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Room.countDocuments(query);

    res.json({
      success: true,
      data: rooms,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get single room
// @route GET /api/rooms/:id
// @access Public
export const getRoom = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid room ID" });
    }

    // Populate hotel and nested owner safely
    const room = await Room.findById(id)
      .populate({
        path: "hotel",
        select: "name address city ownerId",
        populate: {
          path: "owner",
          select: "name email image",
          options: { strictPopulate: false }, // prevents error if owner missing
        },
      })
      .select("-__v");

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    const roomObj = room.toObject();

    // Get approved testimonials, safely populate users
    const testimonials = await Testimonial.find({
      room: id,
      isApproved: true,
    }).populate({
      path: "user",
      select: "name",
      options: { strictPopulate: false },
    });

    const totalReviews = testimonials.length;
    const avgRating = totalReviews
      ? testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / totalReviews
      : 0;

    // Safe discount calculation
    const discount = roomObj.discount || { amount: 0, type: "fixed" };
    let discountedPrice = roomObj.pricePerNight;
    let hasDiscount = false;

    if (discount.amount > 0) {
      hasDiscount = true;
      discountedPrice =
        discount.type === "percentage"
          ? roomObj.pricePerNight * (1 - discount.amount / 100)
          : Math.max(0, roomObj.pricePerNight - discount.amount);
    }

    res.json({
      success: true,
      data: {
        ...roomObj,
        hotelOwner: roomObj.hotel?.owner || null,
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalReviews,
        discountedPrice: Math.round(discountedPrice),
        hasDiscount,
        reviews: testimonials,
      },
    });
  } catch (error) {
    console.error("Error in getRoom:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching room",
      error: error.message,
    });
  }
};


export const checkRoomAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, guests } = req.body;

    // Validate room ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid room ID" });
    }

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    // Check number of guests
    if (guests > room.maxGuests) {
      return res.status(400).json({ success: false, message: "Too many guests for this room" });
    }

    // TODO: Integrate booking dates if you have bookings collection
    // For now, just check availableRooms
    if (!room.isAvailable || room.availableRooms <= 0) {
      return res.status(400).json({ success: false, message: "Room not available" });
    }

    // Calculate total nights and total price
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return res.status(400).json({ success: false, message: "Invalid check-in/check-out dates" });
    }

    let finalPrice = room.pricePerNight;

    if (room.discount && room.discount.amount > 0) {
      if (room.discount.type === "percentage") {
        finalPrice = room.pricePerNight * (1 - room.discount.amount / 100);
      } else {
        finalPrice = Math.max(0, room.pricePerNight - room.discount.amount);
      }
    }

    const totalPrice = finalPrice * nights;

    res.json({
      success: true,
      data: {
        isAvailable: true,
        nights,
        totalPrice,
      },
    });
  } catch (error) {
    console.error("Error in checkRoomAvailability:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


// export const getRoom = async (req, res) => {
//   try {
//     const room = await Room.findById(req.params.id)
//       .populate(
//         "hotel",
//         "name address city phone email amenities policies checkInTime checkOutTime ownerId"
//       )
//       .select("-__v");

//     if (!room) {
//       return res.status(404).json({
//         success: false,
//         message: "Room not found",
//       });
//     }

//     res.json({
//       success: true,
//       data: room,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error fetching room",
//       error: error.message,
//     });
//   }
// };

// @desc    Update room availability
// @route   PATCH /api/rooms/:id/availability
// @access  Private/Owner
export const updateRoomAvailability = async (req, res) => {
  try {
    const { auth } = req;
    const { isAvailable, availableRooms } = req.body;
    const room = await Room.findById(req.params.id).populate("hotel");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Check if user owns the hotel that this room belongs to
    if (room.hotel.ownerId !== auth.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this room",
      });
    }

    const updateData = {};
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (availableRooms !== undefined) {
      updateData.availableRooms = Math.min(availableRooms, room.totalRooms);
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("hotel");

    res.json({
      success: true,
      message: "Room availability updated successfully",
      data: updatedRoom,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating room availability",
      error: error.message,
    });
  }
};

// @desc Add review to room
// @route POST /api/rooms/:id/reviews
// @access Private
export const addRoomReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.auth.userId;

    // Verify room exists
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Check if user already reviewed this room
    const existingReview = await Testimonial.findOne({
      room: id,
      user: userId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this room",
      });
    }

    // Create testimonial
    const testimonial = new Testimonial({
      room: id,
      user: userId,
      rating,
      comment,
      isApproved: false, // Set to false for moderation
    });

    await testimonial.save();
    await testimonial.populate("user", "name");

    res.status(201).json({
      success: true,
      data: testimonial,
      message: "Review submitted for approval",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private/Owner
export const deleteRoom = async (req, res) => {
  try {
    const { auth } = req;
    const room = await Room.findById(req.params.id).populate("hotel");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Check if user owns the hotel that this room belongs to
    if (room.hotel.ownerId !== auth.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this room",
      });
    }

    await Room.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting room",
      error: error.message,
    });
  }
};