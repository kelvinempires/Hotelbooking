import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

// Get all hotels with filtering and pagination
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
export const getHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel || !hotel.isActive) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

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
export const createHotel = async (req, res) => {
  try {
    console.log("Auth object:", req.auth);
    console.log("User ID:", req.auth?.userId);

    // With ClerkExpressRequireAuth, user info is automatically attached to req.auth
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please log in.",
      });
    }

    const { userId } = req.auth;

    // Validate required fields
    const requiredFields = ["name", "phone", "address", "city", "state"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Create hotel data
    const hotelData = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country || "Nigeria",
      email: req.body.email,
      ownerId: userId,
      ownerEmail: req.body.email || req.auth.user?.primaryEmailAddress, // Use provided email or fallback
      // Set defaults
      isActive: true,
      isVerified: false,
      featured: false,
      category: "Standard",
      starRating: 3,
      checkInTime: "14:00",
      checkOutTime: "12:00",
      policies: {
        cancellation: "Free cancellation up to 24 hours before check-in",
        pets: false,
        smoking: false,
      },
    };

    const hotel = new Hotel(hotelData);
    await hotel.save();

    res.status(201).json({
      success: true,
      message: "Hotel registered successfully! It will be reviewed soon.",
      data: hotel,
    });
  } catch (error) {
    console.error("Hotel creation error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Hotel with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during hotel registration",
    });
  }
};

// Update hotel (owner only)
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

// Delete hotel
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

// Get hotels by owner
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

// Get featured hotels
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
