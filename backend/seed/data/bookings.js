export const bookingSeedData = [
  {
    guestName: "Adebola Johnson",
    guestEmail: "adebola.johnson@email.com",
    guestPhone: "+2348076543210",
    checkInDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    checkOutDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    nights: 3,
    totalAmount: 135000,
    status: "confirmed",
    isPaid: true,
    paymentMethod: "card",
    specialRequests: "Please provide extra pillows",
    room: null, // Will be set dynamically
    hotel: null, // Will be set dynamically
  },
  {
    guestName: "Chinedu Okoro",
    guestEmail: "chinedu.okoro@email.com",
    guestPhone: "+2348098765432",
    checkInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    checkOutDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    nights: 3,
    totalAmount: 75000,
    status: "pending",
    isPaid: false,
    paymentMethod: "transfer",
    specialRequests: "Early check-in if possible",
    room: null,
    hotel: null,
  },
  {
    guestName: "Fatima Bello",
    guestEmail: "fatima.bello@email.com",
    guestPhone: "+2348054321098",
    checkInDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    checkOutDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    nights: 3,
    totalAmount: 255000,
    status: "completed",
    isPaid: true,
    paymentMethod: "card",
    specialRequests: "Anniversary celebration",
    room: null,
    hotel: null,
  },
];
