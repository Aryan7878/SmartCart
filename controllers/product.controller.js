import * as productService from "../services/product.service.js";
import PriceHistory from "../models/priceHistory.model.js";
import Analytics from "../models/analytics.model.js";
import * as analyticsService from "../services/analyticsService.js";
import * as predictionService from "../services/predictionService.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { fetchProductReviews, getFlipkartSubCategories, getUnifiedProductDetails } from "../services/externalProduct.service.js";

/**
 * GET /api/products
 * Returns all products with their latest price from PriceHistory (via aggregation).
 */
export const getAllProducts = asyncHandler(async (req, res) => {
    const products = await productService.getAll(req.query);
    res.status(200).json({ success: true, count: products.length, data: products });
});

/**
 * GET /api/products/:id
 * Returns a single product by MongoDB ObjectId.
 */
export const getProductById = asyncHandler(async (req, res) => {
    const product = await productService.getById(req.params.id);
    res.status(200).json({ success: true, data: product });
});

/**
 * POST /api/products
 * Creates a new product. Body is pre-validated by validate middleware.
 */
export const createProduct = asyncHandler(async (req, res) => {
    const product = await productService.create(req.body);
    res.status(201).json({ success: true, data: product });
});

/**
 * PUT /api/products/:id
 * Partially updates a product. Body is pre-validated by validate middleware.
 */
export const updateProduct = asyncHandler(async (req, res) => {
    const product = await productService.update(req.params.id, req.body);
    res.status(200).json({ success: true, data: product });
});

/**
 * DELETE /api/products/:id
 * Hard-deletes a product.
 */
export const deleteProduct = asyncHandler(async (req, res) => {
    await productService.remove(req.params.id);
    res.status(200).json({ success: true, message: "Product deleted" });
});

/**
 * GET /api/products/:id/analyze
 *
 * Full intelligence pipeline:
 *   1. Fetch all PriceHistory for this product (sorted chronologically)
 *   2. Validate we have enough data points (minimum 2)
 *   3. Run analytics (volatility, trend, discount)
 *   4. Run predictions (7-day, 30-day forecast, drop probability, best buy date)
 *   5. Upsert results into the Analytics collection for caching
 *   6. Return analytics + predictions + raw history in response
 */
export const analyzeProduct = asyncHandler(async (req, res) => {
    const { id: productId } = req.params;

    // ── 1. Fetch chronological price history ─────────────────────────────────
    const history = await PriceHistory.find({ productId }).sort({ date: 1 });

    if (history.length < 2) {
        // Return a partial success instead of a hard error
        // This stops the frontend from crashing if analytics aren't ready
        return res.status(200).json({
            success: true,
            data: {
                analytics: null,
                prediction: null,
                history: history.map((h) => ({ date: h.date, price: h.price })),
                insufficientData: true
            }
        });
    }

    // ── 2. Extract price series ───────────────────────────────────────────────
    const prices = history.map((h) => h.price);
    const currentPrice = prices[prices.length - 1];

    // ── 3. Analytics computations ─────────────────────────────────────────────
    const volatility = analyticsService.calculateVolatility(prices);
    const trend = analyticsService.detectTrendSlope(prices);
    const discountInfo = analyticsService.calculateRealDiscount(currentPrice, prices);

    // ── 4. Prediction computations ────────────────────────────────────────────
    const forecast7 = predictionService.linearRegressionForecast(prices, 7);
    const forecast30 = predictionService.linearRegressionForecast(prices, 30);
    const dropProbInfo = predictionService.calculateDropProbability(prices);
    const bestBuyInfo = predictionService.getBestBuyDate(prices);

    // ── 5. Persist / cache analytics result ──────────────────────────────────
    const analyticsPayload = {
        productId,
        volatilityIndex: Math.min(100, Math.max(0, volatility)),
        trendScore: trend.slope,
        realDiscount: Math.max(0, discountInfo.discountVsHigh),
        buyRecommendation: bestBuyInfo.recommendation,
        predicted7DayPrice: forecast7.forecastPrice,
        predicted30DayPrice: forecast30.forecastPrice,
        bestBuyDate: bestBuyInfo.bestBuyDate,
        dropProbability: dropProbInfo.dropProbability,
    };

    const analytics = await Analytics.findOneAndUpdate(
        { productId },
        analyticsPayload,
        { new: true, upsert: true, returnDocument: 'after' }
    );

    // ── 6. Return combined payload ────────────────────────────────────────────
    res.status(200).json({
        success: true,
        data: {
            analytics,
            prediction: {
                forecast7Day: forecast7,
                forecast30Day: forecast30,
                dropProbability: dropProbInfo,
                bestBuy: bestBuyInfo,
                discount: discountInfo,
            },
            // Raw history for the frontend chart
            history: history.map((h) => ({ date: h.date, price: h.price })),
        },
    });
});
/**
 * GET /api/products/reviews/external?asin=...
 * Fetches real-time reviews from Amazon via RapidAPI.
 */
export const getExternalProductReviews = asyncHandler(async (req, res) => {
    const { asin, country } = req.query;

    if (!asin) {
        throw new AppError("ASIN query parameter is required", 400);
    }

    const reviews = await fetchProductReviews(asin, country || 'IN');

    // MOCK DATA FALLBACK: If no reviews found (often due to placeholder API keys), 
    // provide realistic mock data so the UI can be showcased.
    if (!reviews || reviews.length === 0) {
        return res.status(200).json({
            success: true,
            isMock: true,
            count: 3,
            data: [
                {
                    review_title: "Absolutely incredible performance!",
                    review_comment: "The speed of this device is unmatched. I've been using it for a week now and the battery life is easily lasting me two full days. Highly recommend for power users.",
                    review_star_rating: 5,
                    review_author: "Arjun Mehta",
                    review_date: "2024-03-10"
                },
                {
                    review_title: "Solid build, but pricey",
                    review_comment: "The camera is definitely the best in class, but you are paying a huge premium for the brand. If price isn't an issue, go for it.",
                    review_star_rating: 4,
                    review_author: "Sarah J.",
                    review_date: "2024-03-08"
                },
                {
                    review_title: "Wait for the sale",
                    review_comment: "It's a great phone, but I feel like the previous generation was almost as good. I'd recommend waiting for the price to drop slightly before jumping in.",
                    review_star_rating: 3,
                    review_author: "Rahul Kapoor",
                    review_date: "2024-03-05"
                }
            ]
        });
    }

    res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews
    });
});

/**
 * GET /api/products/categories/flipkart?categoryId=...
 * Fetches sub-categories for a given category from Flipkart via RapidAPI.
 */
export const getFlipkartCategories = asyncHandler(async (req, res) => {
    const { categoryId } = req.query;

    if (!categoryId) {
        throw new AppError("categoryId query parameter is required", 400);
    }

    const categories = await getFlipkartSubCategories(categoryId);

    res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
    });
});

/**
 * GET /api/products/details/external?url=...
 * Fetches real-time product details from multiple marketplaces via RapidAPI.
 */
export const getExternalProductDetails = asyncHandler(async (req, res) => {
    const { url: productUrl } = req.query;

    if (!productUrl) {
        throw new AppError("url query parameter is required", 400);
    }

    const details = await getUnifiedProductDetails(productUrl);

    if (!details) {
        throw new AppError("Could not fetch product details from the provided URL", 404);
    }

    res.status(200).json({
        success: true,
        data: details
    });
});


