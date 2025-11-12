import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    // Hotel Reference
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: [true, "Hotel reference is required"],
    },

    // Room Information
    roomType: {
      type: String,
      required: [true, "Room type is required"],
      trim: true,
    },
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      trim: true,
    },

    // Pricing
    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [0, "Price cannot be negative"],
    },
    currency: {
      type: String,
      default: "NGN",
    },
    discount: {
      amount: { type: Number, default: 0 },
      type: { type: String, enum: ["percentage", "fixed"], default: "fixed" },
      validUntil: Date,
    },

    // Capacity
    maxGuests: {
      type: Number,
      required: [true, "Maximum guests is required"],
      min: [1, "Room must accommodate at least 1 guest"],
    },
    maxAdults: {
      type: Number,
      default: 2,
    },
    maxChildren: {
      type: Number,
      default: 2,
    },
    beds: [
      {
        type: { type: String, enum: ["Single", "Double", "Queen", "King"] },
        count: { type: Number, default: 1 },
      },
    ],

    // Description
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    size: {
      value: Number,
      unit: { type: String, default: "sqm" },
    },

    // Media
    images: [
      {
        url: String,
        caption: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Amenities
    amenities: [String],

    // Availability
    isAvailable: {
      type: Boolean,
      default: true,
    },
    totalRooms: {
      type: Number,
      default: 1,
      min: [1, "Total rooms must be at least 1"],
    },
    availableRooms: {
      type: Number,
      default: 1,
      min: [0, "Available rooms cannot be negative"],
    },

    // Restrictions
    smoking: {
      type: Boolean,
      default: false,
    },
    petsAllowed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for discounted price
roomSchema.virtual("discountedPrice").get(function () {
  if (this.discount.amount > 0) {
    if (this.discount.type === "percentage") {
      return this.pricePerNight * (1 - this.discount.amount / 100);
    } else {
      return Math.max(0, this.pricePerNight - this.discount.amount);
    }
  }
  return this.pricePerNight;
});

// Indexes for performance
roomSchema.index({ hotel: 1, isAvailable: 1 });
roomSchema.index({ roomType: 1 });
roomSchema.index({ pricePerNight: 1 });

// Ensure availableRooms doesn't exceed totalRooms
roomSchema.pre("save", function (next) {
  if (this.availableRooms > this.totalRooms) {
    this.availableRooms = this.totalRooms;
  }
  next();
});

export default mongoose.model("Room", roomSchema);
