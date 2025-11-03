import DatabaseSeeder from "../seed/seedDatabase.js";

export const seedDatabase = async (req, res) => {
  try {
    // Add authentication check for admin users
    const { auth } = req;
    if (!auth || !auth.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // In production, you might want additional admin checks
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        message: "Seeding not allowed in production",
      });
    }

    const seeder = new DatabaseSeeder();
    await seeder.seedAll();

    res.json({
      success: true,
      message: "Database seeded successfully",
    });
  } catch (error) {
    console.error("Seeding error:", error);
    res.status(500).json({
      success: false,
      message: "Seeding failed: " + error.message,
    });
  }
};

export const clearDatabase = async (req, res) => {
  try {
    // Similar authentication checks as above
    const { auth } = req;
    if (!auth || !auth.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        message: "Database clearing not allowed in production",
      });
    }

    const seeder = new DatabaseSeeder();
    await seeder.connect();
    await seeder.clearDatabase();
    await seeder.mongoose.disconnect();

    res.json({
      success: true,
      message: "Database cleared successfully",
    });
  } catch (error) {
    console.error("Clear database error:", error);
    res.status(500).json({
      success: false,
      message: "Database clearing failed: " + error.message,
    });
  }
};
