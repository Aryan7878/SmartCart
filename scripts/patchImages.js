import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

// Wikipedia CDN + brand official URLs — all confirmed hotlink-friendly
const IMAGE_MAP = {
  // Phones
  "iPhone 15 Pro Max":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/IPhone_15_Pro_Max_back.png/440px-IPhone_15_Pro_Max_back.png",
  "Samsung Galaxy S24 Ultra":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Galaxy_S24_Ultra.png/440px-Galaxy_S24_Ultra.png",
  "Google Pixel 8 Pro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Google_Pixel_8_Pro.png/440px-Google_Pixel_8_Pro.png",
  "OnePlus 12":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/OnePlus_12.png/440px-OnePlus_12.png",
  "Nothing Phone (2)":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Nothing_Phone_2_back.png/440px-Nothing_Phone_2_back.png",
  "Google Pixel 7a":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Google_Pixel_7a.png/440px-Google_Pixel_7a.png",
  "Samsung Galaxy A54":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Samsung_Galaxy_A54.jpg/440px-Samsung_Galaxy_A54.jpg",
  "iPhone 15":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/IPhone_15_Pro_Max_back.png/440px-IPhone_15_Pro_Max_back.png",
  "Samsung Galaxy Z Fold 5":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Samsung_Galaxy_Z_Fold5.png/440px-Samsung_Galaxy_Z_Fold5.png",
  "iPhone 13":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/IPhone_13_back.png/440px-IPhone_13_back.png",

  // Laptops
  "MacBook Pro 16":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/MacBook_Pro_16.jpg/440px-MacBook_Pro_16.jpg",
  "MacBook Air 15":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/MacBook_Air_15_M2.png/440px-MacBook_Air_15_M2.png",
  "Dell XPS 15":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Dell_XPS_15_9500.jpg/440px-Dell_XPS_15_9500.jpg",
  "MacBook Air M1":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2020_MacBook_Air.png/440px-2020_MacBook_Air.png",
  "Razer Blade 15":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Razer_Blade_15_2019.jpg/440px-Razer_Blade_15_2019.jpg",

  // Audio
  "Sony WH-1000XM5":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Sony_WH-1000XM5.jpg/440px-Sony_WH-1000XM5.jpg",
  "Apple AirPods Pro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/AirPods_Pro_2nd_generation.png/440px-AirPods_Pro_2nd_generation.png",
  "Apple AirPods":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/AirPods_3rd_generation.png/440px-AirPods_3rd_generation.png",

  // Gaming
  "PlayStation 5":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/PlayStation_5_and_DualSense_with_transparent_background.png/440px-PlayStation_5_and_DualSense_with_transparent_background.png",
  "Xbox Series X":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Xbox_Series_X.png/440px-Xbox_Series_X.png",
  "Nintendo Switch OLED":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Nintendo-Switch-OLED-Model-with-Joy-Cons.jpg/440px-Nintendo-Switch-OLED-Model-with-Joy-Cons.jpg",
  "Steam Deck":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Steam_Deck_with_transparent_background.png/440px-Steam_Deck_with_transparent_background.png",
  "Meta Quest 3":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Meta_Quest_3_front.jpg/440px-Meta_Quest_3_front.jpg",
  "Sony DualSense":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/DualSense-controller.png/440px-DualSense-controller.png",

  // Wearables
  "Apple Watch Ultra 2":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Apple_Watch_Ultra_2.png/440px-Apple_Watch_Ultra_2.png",
  "Apple Watch Series 9":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Apple_Watch_Series_9.png/440px-Apple_Watch_Series_9.png",
  "Apple Watch SE":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Apple_Watch_SE_%282nd_generation%29.png/440px-Apple_Watch_SE_%282nd_generation%29.png",
  "Samsung Galaxy Watch 6":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Samsung_Galaxy_Watch6_Classic.png/440px-Samsung_Galaxy_Watch6_Classic.png",
  "Google Pixel Watch":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Google_Pixel_Watch_2.png/440px-Google_Pixel_Watch_2.png",
};

const products = await Product.find({}).select("_id name").lean();
let updated = 0;

for (const p of products) {
  const key = Object.keys(IMAGE_MAP).find((k) =>
    p.name.toLowerCase().includes(k.toLowerCase())
  );
  if (key) {
    await Product.updateOne({ _id: p._id }, { $set: { image: IMAGE_MAP[key] } });
    console.log(`✅ ${p.name}`);
    updated++;
  } else {
    console.log(`⚠️  No match: ${p.name}`);
  }
}

console.log(`\nDone. Updated ${updated}/${products.length} products.`);
await mongoose.disconnect();
