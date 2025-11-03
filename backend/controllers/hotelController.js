import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

// Get all hotels with filtering and pagination
// @route   GET /api/hotels
// @access  Public
export const getHotels = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      state,
      minRating,
      category,
      amenities,
      featured,
    } = req.query;

    const query = { isActive: true };

    if (city) query.city = new RegExp(city, "i");
    if (state) query.state = new RegExp(state, "i");
    if (minRating) query.starRating = { $gte: parseInt(minRating) };
    if (category) query.category = category;
    if (featured) query.featured = featured === "true";
    if (amenities) {
      query.amenities = { $in: amenities.split(",") };
    }

    const hotels = await Hotel.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ featured: -1, createdAt: -1 });

    const total = await Hotel.countDocuments(query);

    res.json({
      success: true,
      data: hotels,
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

// Get single hotel with rooms
// @route   GET /api/hotels/:id
// @access  Public
export const getHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel || !hotel.isActive) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // Get available rooms for this hotel
    const rooms = await Room.find({
      hotel: req.params.id,
      isAvailable: true,
    });

    res.json({
      success: true,
      data: {
        hotel,
        rooms,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create hotel (for owners)
// @route   POST /api/hotels
// @access  Private/Owner
export const createHotel = async (req, res) => {
  try {
    const { auth } = req;

    const hotelData = {
      ...req.body,
      ownerId: auth.userId,
      ownerEmail: auth.session?.user?.primaryEmailAddress?.emailAddress,
    };

    const hotel = new Hotel(hotelData);
    await hotel.save();

    res.status(201).json({
      success: true,
      message: "Hotel created successfully",
      data: hotel,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update hotel (owner only)
// @route   PUT /api/hotels/:id
// @access  Private/Owner
export const updateHotel = async (req, res) => {
  try {
    const { auth } = req;
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // Check if user is the owner
    if (hotel.ownerId !== auth.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this hotel",
      });
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedHotel,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private/Owner
export const deleteHotel = async (req, res) => {
  try {
    const { auth } = req;
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // Check if user is the owner
    if (hotel.ownerId !== auth.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this hotel",
      });
    }

    // Soft delete - set isActive to false
    await Hotel.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: "Hotel deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get hotels by owner
// @route   GET /api/hotels/owner/my-hotels
// @access  Private/Owner

export const getMyHotels = async (req, res) => {
  try {
    const { auth } = req;
    const { page = 1, limit = 10 } = req.query;

    const hotels = await Hotel.find({ ownerId: auth.userId })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Hotel.countDocuments({ ownerId: auth.userId });

    res.json({
      success: true,
      data: hotels,
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

// @desc    Get featured hotels
// @route   GET /api/hotels/featured
// @access  Public
export const getFeaturedHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({
      isActive: true,
      featured: true,
    })
      .limit(6)
      .sort({ createdAt: -1 })
      .select("-__v");

    res.json({
      success: true,
      count: hotels.length,
      data: hotels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching featured hotels",
      error: error.message,
    });
  }
};
