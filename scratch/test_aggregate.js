import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/product.model.js';
import '../models/priceHistory.model.js';
import '../models/analytics.model.js';

dotenv.config();

async function testAggregate() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");
    
    const pipeline = [
        { $match: {} },
        {
            $lookup: {
                from: "pricehistories",
                localField: "_id",
                foreignField: "productId",
                pipeline: [
                    { $sort: { date: -1 } },
                    { $limit: 1 },
                ],
                as: "history",
            },
        },
        {
            $lookup: {
                from: "analytics",
                localField: "_id",
                foreignField: "productId",
                as: "analyticsData",
            },
        },
        {
            $limit: 60
        }
    ];

    console.log("Running aggregate...");
    const start = Date.now();
    try {
        const results = await Product.aggregate(pipeline);
        console.log(`Success! Found ${results.length} results in ${Date.now() - start}ms`);
    } catch (err) {
        console.error("Aggregate failed:", err);
    }
    process.exit(0);
}

testAggregate();
