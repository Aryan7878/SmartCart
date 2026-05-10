import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js";
import PriceHistory from "../models/priceHistory.model.js";
import Analytics from "../models/analytics.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("MONGO_URI is missing. Set it in your environment before running seed.");
}

const UNSPLASH_BY_CATEGORY = {
  Phones: [
    "photo-1592899677977-9c10ca588bbd",
    "photo-1511707171634-5f897ff02aa9",
    "photo-1616348436168-de43ad0db179",
  ],
  Laptops: [
    "photo-1517336714731-489689fd1ca8",
    "photo-1515879218367-8466d910aaa4",
    "photo-1496181133206-80ce9b88a853",
  ],
  Audio: [
    "photo-1518441902117-f0a3b3d2d4fd",
    "photo-1519671482749-fd09be7ccebf",
    "photo-1546435770-a3e426bf472b",
  ],
  Gaming: [
    "photo-1606144042614-b2417e99c4e3",
    "photo-1603481546579-65d935ba9cdd",
    "photo-1612287230202-1ff1d85d1bdf",
  ],
  Wearables: [
    "photo-1523275335684-37898b6baf30",
    "photo-1546868871-7041f2a55e12",
    "photo-1508685096489-7aacd43bd3b1",
  ],
  default: [
    "photo-1523275335684-37898b6baf30",
    "photo-1517336714731-489689fd1ca8",
    "photo-1511707171634-5f897ff02aa9",
  ],
};

const stableIndex = (str, mod) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return mod ? h % mod : 0;
};

const makeUnsplashImageUrl = (photoId) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=900&q=80`;

const makeMarketplaceSearchUrl = (marketplaceName, productName) => {
  const q = encodeURIComponent(productName || "");
  const name = (marketplaceName || "").toLowerCase();

  if (name.includes("amazon")) return `https://www.amazon.in/s?k=${q}`;
  if (name.includes("flipkart")) return `https://www.flipkart.com/search?q=${q}`;
  if (name.includes("croma")) return `https://www.croma.com/searchB?q=${q}`;
  if (name.includes("reliance")) return `https://www.reliancedigital.in/search?q=${q}`;
  if (name.includes("samsung")) return `https://www.samsung.com/in/search/?searchvalue=${q}`;
  if (name.includes("oneplus")) return `https://www.oneplus.in/search?keyword=${q}`;
  if (name.includes("lenovo")) return `https://www.lenovo.com/in/en/search?text=${q}`;
  if (name.includes("dell")) return `https://www.dell.com/en-in/search/${q}`;
  if (name.includes("hp")) return `https://www.hp.com/in-en/search?q=${q}`;
  if (name.includes("garmin")) return `https://www.google.com/search?q=${encodeURIComponent(`garmin ${productName}`)}`;
  if (name.includes("apple")) return `https://www.apple.com/in/search/${q}`;

  // Fallback: Google query for the store + product
  return `https://www.google.com/search?q=${encodeURIComponent(`${marketplaceName} ${productName}`)}`;
};

const looksLikeValidUrl = (url) => typeof url === "string" && /^https?:\/\/\S+/i.test(url);

const isPlaceholderProductUrl = (url) => {
  if (!url) return true;
  return /\/dp\/B0?7XYZ/i.test(url) || /example\.com/i.test(url);
};

const sanitizeSeedProduct = (p) => {
  const list = UNSPLASH_BY_CATEGORY[p.category] || UNSPLASH_BY_CATEGORY.default;
  const idx = stableIndex(`${p.name}|${p.brand}|${p.category}`, list.length);

  const marketplaces = Array.isArray(p.marketplaces)
    ? p.marketplaces.map((m) => {
        const url = m?.url;
        const safeUrl =
          looksLikeValidUrl(url) && !isPlaceholderProductUrl(url)
            ? url
            : makeMarketplaceSearchUrl(m?.name, p?.name);
        return { ...m, url: safeUrl };
      })
    : [];

  return {
    ...p,
    image: p.image || makeUnsplashImageUrl(list[idx]),
    marketplaces,
  };
};

const randomBetween = (min, max) => min + Math.random() * (max - min);

const generateHistory = (basePrice, days = 30) => {
  const now = new Date();
  const points = [];

  // Random walk around basePrice with mild volatility.
  let price = Math.max(1, Math.round(basePrice * randomBetween(0.93, 1.05)));
  const dailyVol = randomBetween(0.004, 0.02); // 0.4% – 2% moves

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(12, 0, 0, 0);

    const direction = Math.random() < 0.5 ? -1 : 1;
    const move = 1 + direction * randomBetween(0, dailyVol);
    price = Math.max(1, Math.round(price * move));

    points.push({ date: d, price });
  }

  // Nudge last point close to basePrice so "current" feels realistic.
  points[points.length - 1].price = Math.max(1, Math.round(basePrice * randomBetween(0.98, 1.02)));
  return points;
};

const seedProducts = [
  // ──── Phones ────
  {
    name: "iPhone 15 Pro Max - 256GB, Natural Titanium",
    brand: "Apple",
    category: "Phones",
    description: "The ultimate iPhone with aerospace-grade titanium design and A17 Pro chip.",
    price: 159900,
    stock: 120,
    image: "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/h/d/9/-original-imagtc2qzgnnuhhy.jpeg",
    marketplaces: [
      { name: "Amazon", price: 156900, url: "https://amazon.in/dp/B0CHX1W1XY" },
      { name: "Flipkart", price: 159900, url: "https://flipkart.com/apple-iphone-15-pro-max" },
      { name: "Croma", price: 158500, url: "https://croma.com/iphone-15-pro-max" }
    ]
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "Phones",
    description: "AI-powered flagship with Titanium frame and 200MP camera.",
    price: 129999,
    stock: 85,
    image: "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/5/i/7/-original-imagx9egm9mg8tv4.jpeg",
    marketplaces: [
      { name: "Amazon", price: 129999, url: "https://amazon.in/dp/B0CSD875F1" },
      { name: "Samsung Store", price: 129999, url: "https://samsung.com/in/smartphones/galaxy-s24-ultra" }
    ]
  },
  {
    name: "Google Pixel 8 Pro",
    brand: "Google",
    category: "Phones",
    description: "Incredible camera and the best AI features directly from Google.",
    price: 106999,
    stock: 45,
    image: "https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/m/h/k/-original-imagv6f3mshzcy9e.jpeg",
    marketplaces: [
      { name: "Flipkart", price: 104999, url: "https://flipkart.com/google-pixel-8-pro" },
      { name: "Amazon", price: 106999, url: "https://amazon.in/dp/B0CGTV27K7" }
    ]
  },
  {
    name: "OnePlus 12 5G",
    brand: "OnePlus",
    category: "Phones",
    description: "Smooth beyond belief. Snapdragon 8 Gen 3 and Hasselblad Camera.",
    price: 64999,
    stock: 150,
    image: "https://m.media-amazon.com/images/I/717S8S6B0ML.jpg",
    marketplaces: [
      { name: "Amazon", price: 63999, url: "https://amazon.in/dp/B0CQPCM1BD" },
      { name: "OnePlus Store", price: 64999, url: "https://oneplus.in/oneplus-12" }
    ]
  },
  {
    name: "Nothing Phone (2)",
    brand: "Nothing",
    category: "Phones",
    description: "Come to the bright side. Glyph Interface and Nothing OS 2.0.",
    price: 39999,
    stock: 100,
    image: "https://m.media-amazon.com/images/I/7187qC4iC6L.jpg",
    marketplaces: [
      { name: "Flipkart", price: 38999, url: "https://flipkart.com/nothing-phone-2" },
      { name: "Amazon", price: 39999, url: "https://amazon.in/dp/B0C7QS6M27" }
    ]
  },
  {
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "Audio",
    description: "Industry-leading noise cancellation overhead headphones.",
    price: 29990,
    stock: 320,
    image: "https://m.media-amazon.com/images/I/51v4694N9PL.jpg",
    marketplaces: [
      { name: "Amazon", price: 26990, url: "https://amazon.in/dp/B09XS7JWHH" },
      { name: "Croma", price: 28990, url: "https://croma.com/sony-wh-1000xm5" }
    ]
  },
  {
    name: "PlayStation 5 Console (Disc Edition)",
    brand: "Sony",
    category: "Gaming",
    description: "Experience lightning-fast loading with an ultra-high-speed SSD.",
    price: 54990,
    stock: 150,
    image: "https://m.media-amazon.com/images/I/5105TndfbcL.jpg",
    marketplaces: [
      { name: "Amazon", price: 54990, url: "https://amazon.in/dp/B08FV5GC28" },
      { name: "Flipkart", price: 53990, url: "https://flipkart.com/sony-playstation-5" }
    ]
  },
  {
    name: "OnePlus 12 5G",
    brand: "OnePlus",
    category: "Phones",
    description: "Smooth beyond belief. Snapdragon 8 Gen 3 and Hasselblad Camera.",
    price: 64999,
    stock: 150,
    image: "https://images.unsplash.com/photo-1610792516307-ea5acc9d3942?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 63999, url: "https://amazon.in/dp/B0CQPCM1BD" },
      { name: "OnePlus Store", price: 64999, url: "https://oneplus.in/oneplus-12" }
    ]
  },
  {
    name: "iPhone 15 - 128GB, Blue",
    brand: "Apple",
    category: "Phones",
    description: "Dynamic Island, 48MP Main camera, USB-C. A huge leap.",
    price: 79900,
    stock: 200,
    image: "https://images.unsplash.com/photo-1556656793-062ff9878233?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 72999, url: "https://amazon.in/dp/B0CHX68YK9" },
      { name: "Flipkart", price: 71999, url: "https://flipkart.com/apple-iphone-15-blue" }
    ]
  },
  {
    name: "Samsung Galaxy Z Fold 5",
    brand: "Samsung",
    category: "Phones",
    description: "The ultimate foldable with zero-gap hinge and PC-like multitasking.",
    price: 154999,
    stock: 20,
    image: "https://images.unsplash.com/photo-1691435235887-b95086580f84?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 150000, url: "https://amazon.in/dp/B0CC9H5R86" },
      { name: "Croma", price: 154999, url: "https://croma.com/samsung-galaxy-z-fold-5" }
    ]
  },
  {
    name: "Nothing Phone (2)",
    brand: "Nothing",
    category: "Phones",
    description: "Come to the bright side. Glyph Interface and Nothing OS 2.0.",
    price: 39999,
    stock: 100,
    image: "https://images.unsplash.com/photo-1689033322048-52fb3e742ca7?w=800&q=80",
    marketplaces: [
      { name: "Flipkart", price: 38999, url: "https://flipkart.com/nothing-phone-2" },
      { name: "Amazon", price: 39999, url: "https://amazon.in/dp/B0C7QS6M27" }
    ]
  },
  {
    name: "Google Pixel 7a",
    brand: "Google",
    category: "Phones",
    description: "Super fast, secure, and packed with Pixel camera magic.",
    price: 38999,
    stock: 180,
    image: "https://images.unsplash.com/photo-1683935398285-8a2bf61d671f?w=800&q=80",
    marketplaces: [
      { name: "Flipkart", price: 37999, url: "https://flipkart.com/google-pixel-7a" }
    ]
  },
  {
    name: "Samsung Galaxy A54 5G",
    brand: "Samsung",
    category: "Phones",
    description: "Awesome camera, awesome screen, awesome battery life.",
    price: 35999,
    stock: 250,
    image: "https://images.unsplash.com/photo-1682662033066-cd171cd3d596?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 35499, url: "https://amazon.in/dp/B0BZD96472" },
      { name: "Reliance Digital", price: 35999, url: "https://reliancedigital.in/samsung-a54" }
    ]
  },
  {
    name: "iPhone 13 - 128GB",
    brand: "Apple",
    category: "Phones",
    description: "Your new superpower. Advanced dual-camera system.",
    price: 52999,
    stock: 300,
    image: "https://images.unsplash.com/photo-1632661674596-618d8b64d641?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 51999, url: "https://amazon.in/dp/B09G9HD6PD" },
      { name: "Flipkart", price: 50999, url: "https://flipkart.com/apple-iphone-13" }
    ]
  },

  // ──── Laptops ────
  {
    name: "MacBook Pro 16-inch (M3 Max)",
    brand: "Apple",
    category: "Laptops",
    description: "Mind-blowing performance with the M3 Max chip and 36GB RAM.",
    price: 349900,
    stock: 30,
    image: "https://m.media-amazon.com/images/I/618d5bS2lUL._AC_SL1500_.jpg",
    marketplaces: [
      { name: "Apple Store", price: 349900, url: "https://apple.com/in/shop/buy-mac/macbook-pro/16-inch" },
      { name: "Amazon", price: 345000, url: "https://amazon.in/dp/B0CM5KHQXX" }
    ]
  },
  {
    name: "MacBook Air 15-inch (M3)",
    brand: "Apple",
    category: "Laptops",
    description: "Lean, mean, M3 machine. Astounding battery life and thin design.",
    price: 134900,
    stock: 140,
    image: "https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 129990, url: "https://amazon.in/dp/B0CX23H7ZD" },
      { name: "Croma", price: 132000, url: "https://croma.com/apple-macbook-air-15-m3" }
    ]
  },
  {
    name: "Dell XPS 15",
    brand: "Dell",
    category: "Laptops",
    description: "Premium Windows laptop with 4K OLED display and RTX 4060.",
    price: 219990,
    stock: 50,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80",
    marketplaces: [
      { name: "Dell Store", price: 219990, url: "https://dell.com/en-in/shop/laptops/xps-15" },
      { name: "Amazon", price: 215000, url: "https://amazon.in/dp/B0C4MGR94D" }
    ]
  },
  {
    name: "ASUS ROG Zephyrus G14",
    brand: "Asus",
    category: "Laptops",
    description: "Incredible gaming power in a thin 14-inch form factor.",
    price: 164990,
    stock: 65,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 159990, url: "https://amazon.in/dp/B0BWHBL4B1" },
      { name: "Flipkart", price: 162990, url: "https://flipkart.com/asus-rog-zephyrus-g14" }
    ]
  },
  {
    name: "HP Spectre x360",
    brand: "HP",
    category: "Laptops",
    description: "Versatile 2-in-1 laptop with stunning gem-cut design.",
    price: 145999,
    stock: 75,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80",
    marketplaces: [
      { name: "HP Store", price: 145999, url: "https://hp.com/in-en/shop/laptops/spectre" },
      { name: "Amazon", price: 142000, url: "https://amazon.in/dp/B0BDZZW9QZ" }
    ]
  },
  {
    name: "Lenovo ThinkPad X1 Carbon Gen 11",
    brand: "Lenovo",
    category: "Laptops",
    description: "The ultimate business laptop with unmatched keyboard and security.",
    price: 185000,
    stock: 40,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80",
    marketplaces: [
      { name: "Lenovo Store", price: 185000, url: "https://lenovo.com/in/en/laptops/thinkpad/thinkpad-x1" }
    ]
  },
  {
    name: "Acer Swift 3",
    brand: "Acer",
    category: "Laptops",
    description: "Affordable thin-and-light laptop perfect for students.",
    price: 59990,
    stock: 210,
    image: "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 57990, url: "https://amazon.in/dp/B0B42SGF4D" },
      { name: "Flipkart", price: 58500, url: "https://flipkart.com/acer-swift-3" }
    ]
  },
  {
    name: "Razer Blade 15",
    brand: "Razer",
    category: "Laptops",
    description: "Premium CNC aluminum gaming laptop with 240Hz OLED.",
    price: 249999,
    stock: 15,
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 245000, url: "https://amazon.in/dp/B0BQJBPYV9" }
    ]
  },
  {
    name: "MacBook Air M1",
    brand: "Apple",
    category: "Laptops",
    description: "Still the best value MacBook on the market. Amazing battery.",
    price: 79900,
    stock: 450,
    image: "https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 69990, url: "https://amazon.in/dp/B08N5W4NNB" },
      { name: "Flipkart", price: 68990, url: "https://flipkart.com/apple-macbook-air-m1" }
    ]
  },
  {
    name: "Microsoft Surface Laptop 5",
    brand: "Microsoft",
    category: "Laptops",
    description: "Elegant touchscreen laptop with PixelSense display.",
    price: 105999,
    stock: 60,
    image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 102999, url: "https://amazon.in/dp/B0BHC6LZG7" },
      { name: "Reliance Digital", price: 105999, url: "https://reliancedigital.in/surface-laptop-5" }
    ]
  },

  // ──── Audio ────
  {
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "Audio",
    description: "Industry-leading noise cancellation overhead headphones.",
    price: 29990,
    stock: 320,
    image: "https://m.media-amazon.com/images/I/61f1YfTkTDL._AC_SL1500_.jpg",
    marketplaces: [
      { name: "Amazon", price: 26990, url: "https://amazon.in/dp/B09XS7JWHH" },
      { name: "Croma", price: 28990, url: "https://croma.com/sony-wh-1000xm5" }
    ]
  },
  {
    name: "Apple AirPods Pro (2nd Gen)",
    brand: "Apple",
    category: "Audio",
    description: "Active Noise Cancellation, Adaptive Audio, and USB-C.",
    price: 24900,
    stock: 500,
    image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 22499, url: "https://amazon.in/dp/B0CHX7SNDN" },
      { name: "Flipkart", price: 22999, url: "https://flipkart.com/airpods-pro-2nd-gen" }
    ]
  },
  {
    name: "Bose QuietComfort Ultra",
    brand: "Bose",
    category: "Audio",
    description: "Immersive audio and world-class noise cancellation from Bose.",
    price: 35900,
    stock: 110,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 34990, url: "https://amazon.in/dp/B0CCZ26B5V" },
      { name: "Reliance Digital", price: 35900, url: "https://reliancedigital.in/bose-qc-ultra" }
    ]
  },
  {
    name: "Sennheiser Momentum 4",
    brand: "Sennheiser",
    category: "Audio",
    description: "60-hour battery life and audiophile-inspired sound.",
    price: 29990,
    stock: 85,
    image: "https://images.unsplash.com/photo-1598062548091-a6f400ceafdb?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 24990, url: "https://amazon.in/dp/B0B662CYYQ" }
    ]
  },
  {
    name: "Samsung Galaxy Buds 2 Pro",
    brand: "Samsung",
    category: "Audio",
    description: "24-bit Hi-Fi audio and seamless Samsung integration.",
    price: 15999,
    stock: 240,
    image: "https://images.unsplash.com/photo-1634546594396-857e2bbd0fe3?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 13999, url: "https://amazon.in/dp/B0B8CVSJ58" },
      { name: "Samsung Store", price: 15000, url: "https://samsung.com/in/audio/galaxy-buds" }
    ]
  },
  {
    name: "Beats Studio Pro",
    brand: "Beats",
    category: "Audio",
    description: "Custom acoustic platform with lossless audio over USB-C.",
    price: 34990,
    stock: 60,
    image: "https://images.unsplash.com/photo-1584824888795-3bc8b7f7e27e?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 32000, url: "https://amazon.in/dp/B0C8PPFNG8" }
    ]
  },
  {
    name: "Jabra Elite 8 Active",
    brand: "Jabra",
    category: "Audio",
    description: "The world's toughest earbuds. Waterproof and dustproof.",
    price: 17999,
    stock: 130,
    image: "https://images.unsplash.com/photo-1590658268037-6f1115551e24?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 16999, url: "https://amazon.in/dp/B0CGVX3GZV" }
    ]
  },
  {
    name: "Nothing Ear (2)",
    brand: "Nothing",
    category: "Audio",
    description: "Iconic transparent design with personalized active noise cancellation.",
    price: 9999,
    stock: 300,
    image: "https://images.unsplash.com/photo-1631289895039-3d0ddef446ff?w=600&q=80",
    marketplaces: [
      { name: "Flipkart", price: 8999, url: "https://flipkart.com/nothing-ear-2" },
      { name: "Amazon", price: 9999, url: "https://amazon.in/dp/B0BXLWT45Q" }
    ]
  },
  {
    name: "Apple AirPods (3rd Gen)",
    brand: "Apple",
    category: "Audio",
    description: "Spatial audio with dynamic head tracking.",
    price: 19900,
    stock: 400,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 18499, url: "https://amazon.in/dp/B09JQZ5DYM" },
      { name: "Croma", price: 18999, url: "https://croma.com/airpods-3rd-gen" }
    ]
  },
  {
    name: "Sony WF-1000XM5 Earbuds",
    brand: "Sony",
    category: "Audio",
    description: "The best noise-canceling wireless earbuds on the market.",
    price: 24990,
    stock: 180,
    image: "https://images.unsplash.com/photo-1690553765104-dcc99450a1bf?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 23990, url: "https://amazon.in/dp/B0C9MQMGLP" },
      { name: "Sony Store", price: 24990, url: "https://shopatsc.com/wf-1000xm5" }
    ]
  },

  // ──── Gaming ────
  {
    name: "PlayStation 5 Console (Disc Edition)",
    brand: "Sony",
    category: "Gaming",
    description: "Experience lightning-fast loading with an ultra-high-speed SSD.",
    price: 54990,
    stock: 150,
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 54990, url: "https://amazon.in/dp/B08FV5GC28" },
      { name: "Flipkart", price: 53990, url: "https://flipkart.com/sony-playstation-5" }
    ]
  },
  {
    name: "Xbox Series X",
    brand: "Microsoft",
    category: "Gaming",
    description: "The fastest, most powerful Xbox ever.",
    price: 54990,
    stock: 90,
    image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 52990, url: "https://amazon.in/dp/B08J7PR1WM" },
      { name: "Reliance Digital", price: 54990, url: "https://reliancedigital.in/xbox-series-x" }
    ]
  },
  {
    name: "Nintendo Switch OLED Model",
    brand: "Nintendo",
    category: "Gaming",
    description: "Play at home or on the go with a vibrant 7-inch OLED screen.",
    price: 33990,
    stock: 220,
    image: "https://images.unsplash.com/photo-1627844641666-6b2158af244c?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 31990, url: "https://amazon.in/dp/B098RKWHHZ" }
    ]
  },
  {
    name: "Steam Deck OLED (512GB)",
    brand: "Valve",
    category: "Gaming",
    description: "Handheld PC gaming with a stunning HDR OLED display.",
    price: 64999,
    stock: 45,
    image: "https://images.unsplash.com/photo-1678252431945-8fbfce7ec52c?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 62000, url: "https://amazon.in/dp/B07XYZ" }
    ]
  },
  {
    name: "Meta Quest 3 (128GB)",
    brand: "Meta",
    category: "Gaming",
    description: "Breakthrough mixed reality headset.",
    price: 54999,
    stock: 110,
    image: "https://images.unsplash.com/photo-1622979135240-caa66311ddfc?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 52999, url: "https://amazon.in/dp/B0C8VKH1ZH" },
      { name: "Flipkart", price: 54999, url: "https://flipkart.com/meta-quest-3" }
    ]
  },
  {
    name: "Asus ROG Ally (Z1 Extreme)",
    brand: "Asus",
    category: "Gaming",
    description: "Windows handheld gaming powerhouse.",
    price: 69990,
    stock: 80,
    image: "https://images.unsplash.com/photo-1678252431945-8fbfce7ec52c?w=800&q=80",
    marketplaces: [
      { name: "Asus Store", price: 69990, url: "https://asus.com/in/rog-ally" },
      { name: "Amazon", price: 68990, url: "https://amazon.in/dp/B0C8XQYWJD" }
    ]
  },
  {
    name: "Razer DeathAdder V3 Pro",
    brand: "Razer",
    category: "Gaming",
    description: "Ultra-lightweight wireless esports mouse.",
    price: 13999,
    stock: 300,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 12999, url: "https://amazon.in/dp/B0B6YJB2M8" }
    ]
  },
  {
    name: "SteelSeries Arctis Nova Pro Wireless",
    brand: "SteelSeries",
    category: "Gaming",
    description: "Premium gaming audio with active noise cancellation.",
    price: 34999,
    stock: 50,
    image: "https://images.unsplash.com/photo-1608667508764-33cf0726b13a?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 34000, url: "https://amazon.in/dp/B09ZWY9X18" }
    ]
  },
  {
    name: "Corsair K100 RGB Mechanical Keyboard",
    brand: "Corsair",
    category: "Gaming",
    description: "The pinnacle of Corsair keyboard performance and design.",
    price: 22999,
    stock: 75,
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 21500, url: "https://amazon.in/dp/B08GM8KGYM" }
    ]
  },
  {
    name: "Sony DualSense Wireless Controller",
    brand: "Sony",
    category: "Gaming",
    description: "Haptic feedback and adaptive triggers for PS5.",
    price: 5990,
    stock: 500,
    image: "https://images.unsplash.com/photo-1606318801954-d46d46d3360a?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 5490, url: "https://amazon.in/dp/B08FWMBQTG" },
      { name: "Croma", price: 5990, url: "https://croma.com/sony-dualsense" }
    ]
  },

  // ──── Wearables ────
  {
    name: "Apple Watch Ultra 2",
    brand: "Apple",
    category: "Wearables",
    description: "Rugged and capable, built for endurance athletes.",
    price: 89900,
    stock: 65,
    image: "https://rukminim2.flixcart.com/image/832/832/xif0q/smartwatch/a/u/l/watch-ultra-2-apple-original-imagsf882.jpeg",
    marketplaces: [
      { name: "Amazon", price: 87900, url: "https://amazon.in/dp/B0CHX8W1XY" },
      { name: "Apple Store", price: 89900, url: "https://apple.com/in/watch" }
    ]
  },
  {
    name: "Apple Watch Series 9",
    brand: "Apple",
    category: "Wearables",
    description: "A brighter display and the new Double Tap gesture.",
    price: 41900,
    stock: 200,
    image: "https://images.unsplash.com/photo-1434493789847-2f02b0c1e6db?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 39999, url: "https://amazon.in/dp/B0CHX41XYN" },
      { name: "Flipkart", price: 40999, url: "https://flipkart.com/apple-watch-series-9" }
    ]
  },
  {
    name: "Samsung Galaxy Watch 6 Classic",
    brand: "Samsung",
    category: "Wearables",
    description: "Iconic rotating bezel and advanced health monitoring.",
    price: 36999,
    stock: 140,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 34999, url: "https://amazon.in/dp/B0CCSK7K6G" },
      { name: "Samsung Store", price: 36999, url: "https://samsung.com/in/watches" }
    ]
  },
  {
    name: "Garmin Fenix 7X Pro",
    brand: "Garmin",
    category: "Wearables",
    description: "Multisport GPS watch with solar charging.",
    price: 98990,
    stock: 30,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 97500, url: "https://amazon.in/dp/B0CCSK7K" }
    ]
  },
  {
    name: "Fitbit Charge 6",
    brand: "Fitbit",
    category: "Wearables",
    description: "Premium fitness tracker with Google apps.",
    price: 14999,
    stock: 250,
    image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 13999, url: "https://amazon.in/dp/B0CDP3XYZZ" }
    ]
  },
  {
    name: "Garmin Venu 3",
    brand: "Garmin",
    category: "Wearables",
    description: "Advanced health and fitness smartwatch with AMOLED display.",
    price: 44990,
    stock: 80,
    image: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=600&q=80",
    marketplaces: [
      { name: "Garmin Store", price: 44990, url: "https://garmin.co.in/venu" }
    ]
  },
  {
    name: "Google Pixel Watch 2",
    brand: "Google",
    category: "Wearables",
    description: "Help by Google. Health by Fitbit.",
    price: 39999,
    stock: 95,
    image: "https://images.unsplash.com/photo-1665481750212-9c17efdbd5c6?w=600&q=80",
    marketplaces: [
      { name: "Flipkart", price: 38999, url: "https://flipkart.com/pixel-watch-2" }
    ]
  },
  {
    name: "Samsung Galaxy Watch 5 Pro",
    brand: "Samsung",
    category: "Wearables",
    description: "Route workout GPS and monstrous battery life.",
    price: 39999,
    stock: 60,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 32000, url: "https://amazon.in/dp/B0B8CVS" }
    ]
  },
  {
    name: "Apple Watch SE (2nd Gen)",
    brand: "Apple",
    category: "Wearables",
    description: "Essential features for a healthy and active lifestyle.",
    price: 29900,
    stock: 350,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 27900, url: "https://amazon.in/dp/B0BDYV2RB1" },
      { name: "Croma", price: 28500, url: "https://croma.com/apple-watch-se-gen2" }
    ]
  },
  {
    name: "Whoop 4.0",
    brand: "Whoop",
    category: "Wearables",
    description: "A screen-less tracker that monitors recovery, sleep, and strain.",
    price: 24000,
    stock: 120,
    image: "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&q=80",
    marketplaces: [
      { name: "Whoop India", price: 24000, url: "https://whoop.com/in" }
    ]
  }
];

const seedDB = async () => {
    try {
        console.log(`Connecting to MongoDB...`);
        await mongoose.connect(MONGO_URI);
        console.log("Connected successfully.");

        console.log("Emptying old products + intelligence data...");
        await Product.deleteMany({});
        await PriceHistory.deleteMany({});
        await Analytics.deleteMany({});

        console.log(`Seeding ${seedProducts.length} high-quality tech products...`);
        const inserted = await Product.insertMany(seedProducts.map(sanitizeSeedProduct));

        console.log("Generating realistic 30-day price history for charts...");
        const historyDocs = [];
        for (const p of inserted) {
          const base =
            Array.isArray(p.marketplaces) && p.marketplaces.length > 0
              ? Math.min(...p.marketplaces.map((m) => m.price))
              : p.price;

          const series = generateHistory(base, 30);
          for (const point of series) {
            historyDocs.push({
              productId: p._id,
              source: "seed",
              price: point.price,
              date: point.date,
              discountShown: 0,
            });
          }
        }
        await PriceHistory.insertMany(historyDocs);
        
        console.log("✅ Seed complete! Products + price history are ready for graphs.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedDB();
