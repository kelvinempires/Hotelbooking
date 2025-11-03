export const roomSeedData = [
  // Grand Plaza Hotel Rooms
  {
    hotel: null, // Will be set dynamically
    roomType: "Deluxe King Suite",
    roomNumber: "301",
    pricePerNight: 45000,
    currency: "NGN",
    discount: {
      amount: 10,
      type: "percentage",
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    maxGuests: 2,
    maxAdults: 2,
    maxChildren: 0,
    beds: [{ type: "King", count: 1 }],
    description: "Spacious suite with king bed, work desk, and city views",
    size: { value: 45, unit: "sqm" },
    amenities: [
      "WiFi",
      "Air Conditioning",
      "TV",
      "Mini Bar",
      "Safe",
      "Hair Dryer",
    ],
    isAvailable: true,
    totalRooms: 5,
    availableRooms: 3,
    smoking: false,
    petsAllowed: false,
    images: [
      {
        url: "/images/rooms/deluxe-king-1.jpg",
        caption: "Bedroom Area",
        isPrimary: true,
      },
    ],
  },
  {
    hotel: null,
    roomType: "Executive Suite",
    roomNumber: "401",
    pricePerNight: 65000,
    currency: "NGN",
    maxGuests: 3,
    maxAdults: 2,
    maxChildren: 1,
    beds: [
      { type: "King", count: 1 },
      { type: "Single", count: 1 },
    ],
    description:
      "Luxurious executive suite with separate living area and premium amenities",
    size: { value: 65, unit: "sqm" },
    amenities: [
      "WiFi",
      "Air Conditioning",
      "TV",
      "Mini Bar",
      "Safe",
      "Hair Dryer",
      "Jacuzzi",
    ],
    isAvailable: true,
    totalRooms: 3,
    availableRooms: 1,
    smoking: false,
    petsAllowed: false,
    images: [
      {
        url: "/images/rooms/executive-suite-1.jpg",
        caption: "Living Area",
        isPrimary: true,
      },
    ],
  },

  // City View Suites Rooms
  {
    hotel: null,
    roomType: "Standard Queen",
    roomNumber: "201",
    pricePerNight: 25000,
    currency: "NGN",
    discount: {
      amount: 5000,
      type: "fixed",
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
    maxGuests: 2,
    maxAdults: 2,
    maxChildren: 0,
    beds: [{ type: "Queen", count: 1 }],
    description:
      "Comfortable standard room with queen bed and essential amenities",
    size: { value: 30, unit: "sqm" },
    amenities: ["WiFi", "Air Conditioning", "TV", "Work Desk"],
    isAvailable: true,
    totalRooms: 10,
    availableRooms: 7,
    smoking: false,
    petsAllowed: true,
    images: [
      {
        url: "/images/rooms/standard-queen-1.jpg",
        caption: "Comfortable Room",
        isPrimary: true,
      },
    ],
  },

  // Beach Resort & Spa Rooms
  {
    hotel: null,
    roomType: "Ocean View Villa",
    roomNumber: "V101",
    pricePerNight: 85000,
    currency: "NGN",
    maxGuests: 4,
    maxAdults: 3,
    maxChildren: 2,
    beds: [
      { type: "King", count: 1 },
      { type: "Queen", count: 1 },
    ],
    description:
      "Private villa with direct beach access and panoramic ocean views",
    size: { value: 85, unit: "sqm" },
    amenities: [
      "WiFi",
      "Air Conditioning",
      "TV",
      "Mini Bar",
      "Private Pool",
      "Beach Access",
    ],
    isAvailable: true,
    totalRooms: 2,
    availableRooms: 1,
    smoking: false,
    petsAllowed: false,
    images: [
      {
        url: "/images/rooms/ocean-villa-1.jpg",
        caption: "Private Villa",
        isPrimary: true,
      },
    ],
  },
];
