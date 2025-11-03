import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
  {
    // Subscriber Information
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "Please provide a valid email address",
      },
    },

    // Personalization (optional)
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },

    // Preferences
    preferences: {
      promotions: { type: Boolean, default: true },
      newHotels: { type: Boolean, default: true },
      travelTips: { type: Boolean, default: true },
      exclusiveOffers: { type: Boolean, default: true },
    },

    // Location & Segmentation
    city: String,
    country: {
      type: String,
      default: "Nigeria",
    },
    language: {
      type: String,
      default: "en",
    },

    // Subscription Details
    source: {
      type: String,
      enum: ["website", "booking", "social_media", "referral", "other"],
      default: "website",
    },
    ipAddress: String,
    userAgent: String,

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Engagement Tracking
    openCount: {
      type: Number,
      default: 0,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    lastEngagement: Date,

    // Verification
    verificationToken: String,
    verifiedAt: Date,

    // Unsubscription
    unsubscribedAt: Date,
    unsubscribeReason: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
newsletterSchema.index({ isActive: 1, isVerified: 1 });
newsletterSchema.index({ city: 1, country: 1 });
newsletterSchema.index({ createdAt: -1 });

// Virtual for full name
newsletterSchema.virtual("fullName").get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || "";
});

// Method to increment engagement
newsletterSchema.methods.incrementEngagement = function (type = "open") {
  if (type === "open") {
    this.openCount += 1;
  } else if (type === "click") {
    this.clickCount += 1;
  }
  this.lastEngagement = new Date();
  return this.save();
};

// Static method to find active subscribers
newsletterSchema.statics.findActiveSubscribers = function () {
  return this.find({ isActive: true, isVerified: true });
};

// Pre-save to set verification token for new subscribers
newsletterSchema.pre("save", function (next) {
  if (this.isNew && !this.verificationToken) {
    this.verificationToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }
  next();
});

export default mongoose.model("Newsletter", newsletterSchema);
