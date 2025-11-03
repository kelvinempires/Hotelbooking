import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    // Offer Information
    title: {
      type: String,
      required: [true, "Offer title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Offer description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },

    // Hotel Reference
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: [true, "Hotel reference is required"],
    },

    // Room Types (if specific to certain rooms)
    applicableRooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      },
    ],

    // Pricing & Discount
    discountType: {
      type: String,
      enum: ["percentage", "fixed", "package"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value cannot be negative"],
    },
    originalPrice: Number,
    offerPrice: Number,

    // Validity
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Usage Limits
    usageLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    minStay: {
      type: Number,
      default: 1,
    },
    maxStay: {
      type: Number,
      default: null,
    },

    // Booking Conditions
    bookingWindow: {
      startDays: { type: Number, default: 0 }, // Days before check-in
      endDays: { type: Number, default: 365 },
    },
    blackoutDates: [Date],

    // Target Audience
    target: {
      type: String,
      enum: ["all", "new_customers", "returning", "corporate", "family"],
      default: "all",
    },

    // Promotion Details
    promoCode: {
      type: String,
      uppercase: true,
      trim: true,
      sparse: true,
    },
    termsConditions: [String],

    // Media
    image: String,
    bannerImage: String,

    // Status
    isFeatured: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: Number,
      default: 0, // Higher number = higher priority
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
offerSchema.index({ hotel: 1, isActive: 1 });
offerSchema.index({ startDate: 1, endDate: 1 });
offerSchema.index({ isFeatured: 1, isActive: 1 });
// Virtual for checking if offer is currently valid
offerSchema.virtual("isCurrentlyValid").get(function () {
  const now = new Date();
  return (
    this.isActive &&
    this.startDate <= now &&
    this.endDate >= now &&
    (this.usageLimit === null || this.usedCount < this.usageLimit)
  );
});

// Virtual for days remaining
offerSchema.virtual("daysRemaining").get(function () {
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save to calculate offer price if not provided
offerSchema.pre("save", function (next) {
  if (
    this.discountType === "percentage" &&
    this.originalPrice &&
    !this.offerPrice
  ) {
    this.offerPrice = this.originalPrice * (1 - this.discountValue / 100);
  } else if (
    this.discountType === "fixed" &&
    this.originalPrice &&
    !this.offerPrice
  ) {
    this.offerPrice = Math.max(0, this.originalPrice - this.discountValue);
  }
  next();
});

export default mongoose.model("Offer", offerSchema);
