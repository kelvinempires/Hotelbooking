import mongoose from "mongoose";
import dotenv from "dotenv";
import { hotelSeedData } from "./data/hotels.js";
import { roomSeedData } from "./data/rooms.js";
import { bookingSeedData } from "./data/bookings.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";

dotenv.config();

class DatabaseSeeder {
  constructor() {
    this.hotels = [];
    this.rooms = [];
  }

  async connect() {
    try {
      await mongoose.connect(
        process.env.MONGODB_URI || "mongodb://localhost:27017/hotel-booking"
      );
      console.log("✅ Connected to MongoDB");
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      process.exit(1);
    }
  }

  async clearDatabase() {
    try {
      await Hotel.deleteMany({});
      await Room.deleteMany({});
      await Booking.deleteMany({});
      console.log("✅ Database cleared");
    } catch (error) {
      console.error("❌ Error clearing database:", error);
    }
  }

  async seedHotels() {
    try {
      this.hotels = await Hotel.insertMany(hotelSeedData);
      console.log(`✅ ${this.hotels.length} hotels seeded`);
      return this.hotels;
    } catch (error) {
      console.error("❌ Error seeding hotels:", error);
      throw error;
    }
  }

  async seedRooms() {
    try {
      // Assign hotels to rooms
      const roomsWithHotels = roomSeedData.map((room, index) => {
        const hotelIndex = index % this.hotels.length;
        return {
          ...room,
          hotel: this.hotels[hotelIndex]._id,
        };
      });

      this.rooms = await Room.insertMany(roomsWithHotels);
      console.log(`✅ ${this.rooms.length} rooms seeded`);
      return this.rooms;
    } catch (error) {
      console.error("❌ Error seeding rooms:", error);
      throw error;
    }
  }

  async seedBookings() {
    try {
      // Assign rooms and hotels to bookings
      const bookingsWithReferences = bookingSeedData.map((booking, index) => {
        const roomIndex = index % this.rooms.length;
        const room = this.rooms[roomIndex];

        return {
          ...booking,
          room: room._id,
          hotel: room.hotel,
        };
      });

      const bookings = await Booking.insertMany(bookingsWithReferences);
      console.log(`✅ ${bookings.length} bookings seeded`);
      return bookings;
    } catch (error) {
      console.error("❌ Error seeding bookings:", error);
      throw error;
    }
  }

  async seedAll() {
    try {
      await this.connect();

      console.log("🚀 Starting database seeding...");

      // Clear existing data
      await this.clearDatabase();

      // Seed in order: Hotels → Rooms → Bookings
      await this.seedHotels();
      await this.seedRooms();
      await this.seedBookings();

      console.log("🎉 Database seeding completed successfully!");
      console.log("📊 Summary:");
      console.log(`   • Hotels: ${this.hotels.length}`);
      console.log(`   • Rooms: ${this.rooms.length}`);
      console.log(`   • Bookings: ${await Booking.countDocuments()}`);
    } catch (error) {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      console.log("🔌 Disconnected from MongoDB");
    }
  }
}

// Run seeding if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const seeder = new DatabaseSeeder();
  seeder.seedAll();
}

export default DatabaseSeeder;
