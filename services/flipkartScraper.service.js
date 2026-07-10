import Product from "../models/product.model.js";

export const scrapeFlipkart = async (query) => {
    console.log(`[Scraper] Fetching Flipkart mock data for: "${query}"...`);
    
    // Simulate real-world external API latency
    await new Promise(resolve => setTimeout(resolve, 800));

    let basePrice = Math.floor(Math.random() * 40000) + 15000;
    let displayName = query;
    try {
        const product = await Product.findOne({ name: { $regex: new RegExp(query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i') } });
        if (product) {
            displayName = product.name;
            if (product.price) {
                // Apply a slight variation for Flipkart price (between -5% and +2% of original price)
                const variation = (Math.random() * 0.07 - 0.05);
                basePrice = Math.round(product.price * (1 + variation));
            }
        }
    } catch (err) {
        console.error("[Flipkart Scraper] DB lookup error:", err);
    }
    
    return [
        {
            name: displayName,
            price: basePrice,
            url: `https://www.flipkart.com/search?q=${encodeURIComponent(displayName)}`,
            image: `https://via.placeholder.com/600x400.png?text=${encodeURIComponent(displayName)}`,
            marketplace: "Flipkart"
        }
    ];
};
