import Offer from "../models/Offer.js";
import Hotel from "../models/Hotel.js";

// Get active offers with filtering
// @route   GET /api/offers
// @access  Public
export const getOffers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      hotelId,
      active = true,
      featured,
    } = req.query;

    const query = { isActive: active };

    if (hotelId) query.hotel = hotelId;
    if (featured) query.isFeatured = featured === "true";

    // Add date filtering for active offers
    if (active) {
      const now = new Date();
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    }

    const offers = await Offer.find(query)
      .populate("hotel")
      .populate("applicableRooms")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ priority: -1, isFeatured: -1, createdAt: -1 });

    const total = await Offer.countDocuments(query);

    // Add virtual fields
    const offersWithVirtuals = offers.map((offer) => {
      const offerObj = offer.toObject();
      offerObj.isCurrentlyValid = offer.isCurrentlyValid;
      offerObj.daysRemaining = offer.daysRemaining;
      return offerObj;
    });

    res.json({
      success: true,
      data: offersWithVirtuals,
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

// @desc    Get single offer
// @route   GET /api/offers/:id
// @access  Public
export const getOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate("hotel", "name address city phone email amenities policies")
      .populate(
        "applicableRooms",
        "roomType pricePerNight images amenities maxGuests"
      )
      .select("-__v");

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.json({
      success: true,
      data: offer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching offer",
      error: error.message,
    });
  }
};

// Create offer (hotel owner only)
// @route   POST /api/offers
// @access  Private/Owner
export const createOffer = async (req, res) => {
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
        message: "Not authorized to create offers for this hotel",
      });
    }

    const offer = new Offer(req.body);
    await offer.save();
    await offer.populate("hotel");
    await offer.populate("applicableRooms");

    res.status(201).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update offer (hotel owner only)
// @route   PUT /api/offers/:id
// @access  Private/Owner
export const updateOffer = async (req, res) => {
  try {
    const { auth } = req;
    const offer = await Offer.findById(req.params.id).populate("hotel");

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    if (offer.hotel.ownerId !== auth.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this offer",
      });
    }

    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("hotel")
      .populate("applicableRooms");

    res.json({
      success: true,
      data: updatedOffer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete offer
// @route   DELETE /api/offers/:id
// @access  Private/Owner
export const deleteOffer = async (req, res) => {
  try {
    const { auth } = req;
    const offer = await Offer.findById(req.params.id).populate("hotel");

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    if (offer.hotel.ownerId !== auth.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this offer",
      });
    }

    await Offer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error deleting offer",
      error: error.message,
    });
  }
};

// Validate promo code
export const validatePromoCode = async (req, res) => {
  try {
    const { promoCode, hotelId } = req.body;
    const now = new Date();

    const offer = await Offer.findOne({
      promoCode: promoCode.toUpperCase(),
      hotel: hotelId,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [{ usageLimit: null }, { usageLimit: { $gt: 0 } }],
    })
      .populate("hotel")
      .populate("applicableRooms");

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired promo code",
      });
    }

    const offerObj = offer.toObject();
    offerObj.isCurrentlyValid = offer.isCurrentlyValid;
    offerObj.daysRemaining = offer.daysRemaining;

    res.json({
      success: true,
      data: offerObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Toggle offer active status
// @route   PATCH /api/offers/:id/toggle-active
// @access  Private/Ownerexport

const toggleOfferActive = async (req, res) => {
  try {
    const { auth } = req;
    const offer = await Offer.findById(req.params.id).populate("hotel");

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    if (offer.hotel.ownerId !== auth.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this offer",
      });
    }

    offer.isActive = !offer.isActive;
    await offer.save();

    res.json({
      success: true,
      message: `Offer ${
        offer.isActive ? "activated" : "deactivated"
      } successfully`,
      data: offer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get featured offers
// @route   GET /api/offers/featured
// @access  Public
export const getFeaturedOffers = async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      isFeatured: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate("hotel", "name address city images starRating")
      .populate("applicableRooms", "roomType pricePerNight images")
      .sort({ priority: -1, discountValue: -1 })
      .limit(8)
      .select("-__v");

    res.json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching featured offers",
      error: error.message,
    });
  }
};
