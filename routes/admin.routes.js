import { Router } from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Watchlist from "../models/watchlist.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { runPriceTracker } from "../cron/priceTracker.job.js";

const router = Router();

// Protect all admin routes
router.use(protect);
router.use(authorize("admin"));

/**
 * GET /api/admin/stats
 * Returns aggregate counts for the dashboard
 */
router.get("/stats", asyncHandler(async (req, res) => {
    const [userCount, productCount, alertCount] = await Promise.all([
        User.countDocuments({ role: "customer" }),
        Product.countDocuments({}),
        Watchlist.countDocuments({ isActive: true })
    ]);

    res.status(200).json({
        success: true,
        data: {
            users: userCount,
            products: productCount,
            activeAlerts: alertCount,
            systemStatus: "Healthy"
        }
    });
}));

/**
 * POST /api/admin/refresh-all
 * Manually triggers the price tracking scrape job
 */
router.post("/refresh-all", asyncHandler(async (req, res) => {
    // Run in background without waiting for completion (to avoid timeout)
    runPriceTracker();
    
    res.status(200).json({
        success: true,
        message: "Background price tracker job initialized manually."
    });
}));

/**
 * GET /api/admin/users
 * Returns a list of users
 */
router.get("/users", asyncHandler(async (req, res) => {
    const users = await User.find({}).select("-password").sort("-createdAt");
    res.status(200).json({ success: true, data: users });
}));

export default router;
