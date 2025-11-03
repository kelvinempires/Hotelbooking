import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    // Customer Information
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    customerAvatar: String,

    // Hotel Reference
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: [true, "Hotel reference is required"],
    },

    // Room Reference (optional)
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },

    // Review Content
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },

    // Review Details
    stayDate: {
      type: Date,
      required: [true, "Stay date is required"],
    },
    tripType: {
      type: String,
      enum: ["Business", "Leisure", "Family", "Romantic", "Other"],
      default: "Leisure",
    },

    // Verified Booking
    verifiedBooking: {
      type: Boolean,
      default: false,
    },
    bookingReference: String,

    // Response from Hotel
    hotelResponse: {
      response: String,
      respondedAt: Date,
      respondedBy: String, // Clerk user ID
    },

    // Status
    isApproved: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Helpfulness
    helpfulCount: {
      type: Number,
      default: 0,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
testimonialSchema.index({ hotel: 1, isApproved: 1 });
testimonialSchema.index({ rating: 1, isApproved: 1 });
testimonialSchema.index({ isFeatured: 1, isApproved: 1 });
testimonialSchema.index({ createdAt: -1 });

// Virtual for formatted stay date
testimonialSchema.virtual("formattedStayDate").get(function () {
  return this.stayDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
});

export default mongoose.model("Testimonial", testimonialSchema);
