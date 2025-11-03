import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Hotel name is required"],
      trim: true,
      maxlength: [100, "Hotel name cannot exceed 100 characters"],
    },

    // Ownership (Clerk user ID from frontend)
    ownerId: {
      type: String,
      required: [true, "Owner ID is required"],
    },
    ownerEmail: {
      type: String,
      required: [true, "Owner email is required"],
    },

    // Location
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    country: {
      type: String,
      default: "Nigeria",
      trim: true,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },

    // Contact Information
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    website: {
      type: String,
      trim: true,
    },

    // Description
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },

    // Media
    images: [
      {
        url: String,
        caption: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    coverImage: String,

    // Amenities
    amenities: [String],

    // Hotel Details
    starRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    category: {
      type: String,
      enum: ["Budget", "Standard", "Luxury", "Boutique", "Resort"],
      default: "Standard",
    },

    // Policies
    checkInTime: {
      type: String,
      default: "14:00",
    },
    checkOutTime: {
      type: String,
      default: "12:00",
    },
    policies: {
      cancellation: String,
      pets: { type: Boolean, default: false },
      smoking: { type: Boolean, default: false },
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
hotelSchema.index({ city: 1, isActive: 1 });
hotelSchema.index({ ownerId: 1 });
hotelSchema.index({ featured: 1, isActive: 1 });

export default mongoose.model("Hotel", hotelSchema);
