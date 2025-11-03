import Testimonial from "../models/Testimonial.js";
import Hotel from "../models/Hotel.js";

// Get testimonials with filtering
// @route   GET /api/testimonials
// @access  Public
export const getTestimonials = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      hotelId,
      minRating,
      featured,
      approved = true,
    } = req.query;

    const query = { isApproved: approved };

    if (hotelId) query.hotel = hotelId;
    if (minRating) query.rating = { $gte: parseInt(minRating) };
    if (featured) query.isFeatured = featured === "true";

    const testimonials = await Testimonial.find(query)
      .populate("hotel")
      .populate("room")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ isFeatured: -1, createdAt: -1 });

    const total = await Testimonial.countDocuments(query);

    res.json({
      success: true,
      data: testimonials,
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

// @desc    Get single testimonial
// @route   GET /api/testimonials/:id
// @access  Public
export const getTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id)
      .populate("hotel", "name address city images")
      .populate("room", "roomType images")
      .select("-__v");

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching testimonial",
      error: error.message,
    });
  }
};

// Create testimonial
// @route   POST /api/testimonials
// @access  Private
export const createTestimonial = async (req, res) => {
  try {
    const { auth } = req;

    // Verify hotel exists
    const hotel = await Hotel.findOne({
      _id: req.body.hotel,
      isActive: true,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    const testimonialData = {
      ...req.body,
      // If user is authenticated, link their info
      ...(auth && {
        customerEmail: auth.session?.user?.primaryEmailAddress?.emailAddress,
      }),
    };

    const testimonial = new Testimonial(testimonialData);
    await testimonial.save();
    await testimonial.populate("hotel");

    res.status(201).json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update testimonial (admin/hotel owner)
// @route   PUT /api/testimonials/:id
// @access  Private/Owner or Admin
export const updateTestimonial = async (req, res) => {
  try {
    const { auth } = req;
    const testimonial = await Testimonial.findById(req.params.id).populate(
      "hotel"
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    // Check if user is hotel owner or admin
    if (testimonial.hotel.ownerId !== auth.userId) {
      // You might want to add admin check here
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this testimonial",
      });
    }

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("hotel");

    res.json({
      success: true,
      data: updatedTestimonial,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private/Owner or Admin
export const deleteTestimonial = async (req, res) => {
  try {
    const { auth } = req;
    const testimonial = await Testimonial.findById(req.params.id).populate(
      "hotel"
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    // Check if user is hotel owner or admin
    if (testimonial.hotel.ownerId !== auth.userId) {
      // You might want to add admin check here
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this testimonial",
      });
    }

    await Testimonial.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// Mark testimonial as helpful
export const markHelpful = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get testimonials by hotel
// @route   GET /api/testimonials/hotel/:hotelId
// @access  Public
export const getTestimonialsByHotel = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({
      hotel: req.params.hotelId,
      isApproved: true,
    })
      .populate("room", "roomType")
      .sort({ createdAt: -1 })
      .select("-__v");

    // Calculate average rating
    const averageRating = await Testimonial.aggregate([
      {
        $match: {
          hotel: mongoose.Types.ObjectId(req.params.hotelId),
          isApproved: true,
        },
      },
      { $group: { _id: null, average: { $avg: "$rating" } } },
    ]);

    res.json({
      success: true,
      count: testimonials.length,
      averageRating: averageRating[0]?.average || 0,
      data: testimonials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching hotel testimonials",
      error: error.message,
    });
  }
};

// @desc    Approve testimonial (for hotel owners/admins)
// @route   PATCH /api/testimonials/:id/approve
// @access  Private/Owner
export const approveTestimonial = async (req, res) => {
  try {
    const { auth } = req;
    const testimonial = await Testimonial.findById(req.params.id).populate(
      "hotel"
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    // Check if user is hotel owner or admin
    if (testimonial.hotel.ownerId !== auth.userId) {
      // You might want to add admin check here
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this testimonial",
      });
    }

  testimonial.isApproved = true;
    await testimonial.save();

    res.json({
      success: true,
      data: updatedTestimonial,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Feature/unfeature testimonial
// @route   PATCH /api/testimonials/:id/feature
// @access  Private/Owner
export const toggleFeatureTestimonial = async (req, res) => {
  try {
    const { auth } = req;
    const testimonial = await Testimonial.findById(req.params.id).populate(
      "hotel"
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    // Check if user is hotel owner or admin
    if (testimonial.hotel.ownerId !== auth.userId) {
      // You might want to add admin check here
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this testimonial",
      });
    }

    testimonial.isFeatured = !testimonial.isFeatured;
    await testimonial.save();
   res.json({
      success: true,
      message: `Testimonial ${
        testimonial.isFeatured ? "featured" : "unfeatured"
      } successfully`,
      data: testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating testimonial feature status",
      error: error.message,
    });
  }
};