import { Router } from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Watchlist from "../models/watchlist.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { runPriceTracker } from "../cron/priceTracker.job.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const router = Router();

/**
 * POST /api/admin/db-reset-secure
 * Unprotected, secret-authenticated database reset and seeding route.
 */
router.post("/db-reset-secure", asyncHandler(async (req, res) => {
    const { secret } = req.query;
    if (secret !== "antigravityReset123") {
        return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    try {
        console.log("[Render Reset] Seeding database...");
        const { stdout: seedOut } = await execAsync("node scripts/seed.js");
        
        console.log("[Render Reset] Fixing product images...");
        const { stdout: fixOut } = await execAsync("node scripts/fix-images.mjs");

        res.status(200).json({
            success: true,
            message: "Database seeded and images fixed successfully on Render!",
            seedOut,
            fixOut
        });
    } catch (err) {
        console.error("[Render Reset] Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
}));

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
