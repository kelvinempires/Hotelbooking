import Newsletter from "../models/Newsletter.js";

// Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
export const subscribe = async (req, res) => {
  try {
    const { email, firstName, lastName, preferences, source } = req.body;

    // Check if already subscribed
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(400).json({
          success: false,
          message: "Email already subscribed",
        });
      } else {
        // Reactivate unsubscribed user
        existingSubscriber.isActive = true;
        existingSubscriber.unsubscribedAt = null;
        existingSubscriber.unsubscribeReason = null;
        await existingSubscriber.save();

        return res.json({
          success: true,
          message: "Successfully resubscribed to newsletter",
          data: existingSubscriber,
        });
      }
    }

    const subscriberData = {
      email,
      firstName,
      lastName,
      preferences,
      source: source || "website",
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    };

    const subscriber = new Newsletter(subscriberData);
    await subscriber.save();

    // In a real application, send verification email here
    console.log(
      `Verification token for ${email}: ${subscriber.verificationToken}`
    );

    res.status(201).json({
      success: true,
      message:
        "Successfully subscribed to newsletter. Please check your email for verification.",
      data: subscriber,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify subscription
// @route   GET /api/newsletter/verify/:token
// @access  Public
export const verifySubscription = async (req, res) => {
  try {
    const { token } = req.query;

    const subscriber = await Newsletter.findOne({ verificationToken: token });
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Invalid verification token",
      });
    }

    if (subscriber.isVerified) {
      return res.json({
        success: true,
        message: "Email already verified",
      });
    }

    subscriber.isVerified = true;
    subscriber.verifiedAt = new Date();
    subscriber.verificationToken = null;
    await subscriber.save();

    res.json({
      success: true,
      message: "Email successfully verified",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update preferences
// @route   PUT /api/newsletter/preferences
// @access  Public
export const updatePreferences = async (req, res) => {
  try {
    const { email, preferences } = req.body;

    const subscriber = await Newsletter.findOne({ email, isActive: true });
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found",
      });
    }

    if (preferences) {
      subscriber.preferences = { ...subscriber.preferences, ...preferences };
    }

    await subscriber.save();

    res.json({
      success: true,
      message: "Preferences updated successfully",
      data: subscriber,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Unsubscribe
// @route   POST /api/newsletter/unsubscribe
// @access  Public
export const unsubscribe = async (req, res) => {
  try {
    const { email, reason } = req.body;

    const subscriber = await Newsletter.findOne({ email, isActive: true });
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found",
      });
    }

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    subscriber.unsubscribeReason = reason;
    await subscriber.save();

    res.json({
      success: true,
      message: "Successfully unsubscribed from newsletter",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get subscribers (admin only)
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
export const getSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 20, active = true } = req.query;

    const query = { isActive: active };
    if (active) query.isVerified = true;

    const subscribers = await Newsletter.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Newsletter.countDocuments(query);

    res.json({
      success: true,
      data: subscribers,
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

// @desc    Get subscriber statistics
// @route   GET /api/newsletter/stats
// @access  Private/Admin
export const getNewsletterStats = async (req, res) => {
  try {
    const totalSubscribers = await Newsletter.countDocuments({
      isActive: true,
    });
    const totalUnsubscribed = await Newsletter.countDocuments({
      isActive: false,
    });

    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const newThisWeek = await Newsletter.countDocuments({
      createdAt: { $gte: lastWeek },
      isActive: true,
    });

    const topCities = await Newsletter.aggregate([
      { $match: { isActive: true, city: { $exists: true, $ne: "" } } },
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      data: {
        totalSubscribers,
        totalUnsubscribed,
        newThisWeek,
        topCities,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching newsletter statistics",
      error: error.message,
    });
  }
};