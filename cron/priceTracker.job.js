import cron from "node-cron";
import Product from "../models/product.model.js";
import PriceHistory from "../models/priceHistory.model.js";
import Analytics from "../models/analytics.model.js";
import { searchExternalProducts } from "../services/search.service.js";
import * as analyticsService from "../services/analyticsService.js";
import * as predictionService from "../services/predictionService.js";
import Watchlist from "../models/watchlist.model.js";
import { sendPriceAlert } from "../services/email.service.js";

/**
 * Executes the full background price tracking cycle.
 */
export const runPriceTracker = async () => {
    console.log("[Cron] Starting automated price tracking cycle...");
    try {
        const products = await Product.find({});
        for (const product of products) {
            console.log(`[Cron] Fetching latest prices for: ${product.name}`);
            
            // 1. Fetch latest prices via scraper combinator
            const scrapedResults = await searchExternalProducts(product.name);
            
            // Find exact match or fallback to the closest first result
            const match = scrapedResults.find(r => r.name.toLowerCase() === product.name.toLowerCase()) || scrapedResults[0];
            
            if (match && match.marketplaces && match.marketplaces.length > 0) {
                // Keep the live Product marketplaces array up-to-date
                product.marketplaces = match.marketplaces;
                await product.save();

                // 2. Store individual snapshots in PriceHistory for regression points
                for (const mp of match.marketplaces) {
                    await PriceHistory.create({
                        productId: product._id,
                        source: mp.name, // e.g. "Amazon"
                        price: mp.price
                    });
                }

                // 3. Recalculate Intelligence Analytics directly in background
                const history = await PriceHistory.find({ productId: product._id }).sort({ date: 1 });
                if (history.length >= 2) {
                    const prices = history.map((h) => h.price);
                    const currentPrice = prices[prices.length - 1];

                    const volatility = analyticsService.calculateVolatility(prices);
                    const trend = analyticsService.detectTrendSlope(prices);
                    const discountInfo = analyticsService.calculateRealDiscount(currentPrice, prices);
                    
                    const forecast7 = predictionService.linearRegressionForecast(prices, 7);
                    const forecast30 = predictionService.linearRegressionForecast(prices, 30);
                    const dropProbInfo = predictionService.calculateDropProbability(prices);
                    const bestBuyInfo = predictionService.getBestBuyDate(prices);

                    await Analytics.findOneAndUpdate(
                        { productId: product._id },
                        {
                            productId: product._id,
                            volatilityIndex: Math.min(100, Math.max(0, volatility)),
                            trendScore: trend.slope,
                            realDiscount: Math.max(0, discountInfo.discountVsHigh),
                            buyRecommendation: bestBuyInfo.recommendation,
                            predicted7DayPrice: forecast7.forecastPrice,
                            predicted30DayPrice: forecast30.forecastPrice,
                            bestBuyDate: bestBuyInfo.bestBuyDate,
                            dropProbability: dropProbInfo.dropProbability,
                        },
                        { new: true, upsert: true, returnDocument: 'after' }
                    );
                    console.log(`[Cron] Extracted node & computed analytics for ${product.name}`);
                }

                // 4. Check Watchlist for Price Drop Alerts
                const watchlists = await Watchlist.find({ 
                    product: product._id, 
                    isActive: true, 
                    notified: false 
                }).populate('user');

                for (const item of watchlists) {
                    const currentBestPrice = Math.min(...product.marketplaces.map(m => m.price));
                    
                    if (currentBestPrice <= item.targetPrice) {
                        await sendPriceAlert(item.user.email, {
                            productName: product.name,
                            targetPrice: item.targetPrice,
                            currentPrice: currentBestPrice,
                            productUrl: product.marketplaces[0]?.url || "",
                            productImage: product.image
                        });

                        // Deactivate or mark as notified
                        item.notified = true;
                        item.isActive = false; // Only alert once by default
                        await item.save();
                    }
                }
            } else {
                console.log(`[Cron] No live options found for ${product.name}`);
            }
            
            // Rate-limit spacer to prevent headless Chrome from being flagged easily
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        console.log("[Cron] Automated price tracking cycle completed.");
    } catch (error) {
        console.error("[Cron] Error during price tracking:", error);
    }
};

/**
 * Initializes the node-cron scheduler.
 * Runs every 6 hours: 0 0,6,12,18 * * *
 */
export const startPriceTrackerJob = () => {
    cron.schedule("0 */6 * * *", runPriceTracker);
    console.log("[Cron] Price tracker scheduled to run every 6 hours.");
};
