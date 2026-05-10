import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

// Exact name patches for products that didn't match the first pass
const EXACT_MAP = {
  "ASUS ROG Zephyrus G14": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/ASUS_ROG_Zephyrus_G14_%282022%29.png/440px-ASUS_ROG_Zephyrus_G14_%282022%29.png",
  "HP Spectre x360": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/HP_Spectre_x360_13t_2019.jpg/440px-HP_Spectre_x360_13t_2019.jpg",
  "Lenovo ThinkPad X1 Carbon Gen 11": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/ThinkPad_X1_Carbon_9th.jpg/440px-ThinkPad_X1_Carbon_9th.jpg",
  "Acer Swift 3": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Acer_Swift_3_2021.jpg/440px-Acer_Swift_3_2021.jpg",
  "Microsoft Surface Laptop 5": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Microsoft_Surface_Laptop_4.jpg/440px-Microsoft_Surface_Laptop_4.jpg",
  "Bose QuietComfort Ultra": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Bose_QuietComfort_45.jpg/440px-Bose_QuietComfort_45.jpg",
  "Sennheiser Momentum 4": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Sennheiser_Momentum_4_Wireless.jpg/440px-Sennheiser_Momentum_4_Wireless.jpg",
  "Samsung Galaxy Buds 2 Pro": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Samsung_Galaxy_Buds2_Pro.png/440px-Samsung_Galaxy_Buds2_Pro.png",
  "Beats Studio Pro": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Beats_Studio3_Wireless.jpg/440px-Beats_Studio3_Wireless.jpg",
  "Jabra Elite 8 Active": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Jabra_Elite_75t.jpg/440px-Jabra_Elite_75t.jpg",
  "Nothing Ear (2)": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Nothing_Ear_%281%29.png/440px-Nothing_Ear_%281%29.png",
  "Sony WF-1000XM5 Earbuds": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Sony_WF-1000XM4.jpg/440px-Sony_WF-1000XM4.jpg",
  "Asus ROG Ally (Z1 Extreme)": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/ASUS_ROG_Ally.jpg/440px-ASUS_ROG_Ally.jpg",
  "Razer DeathAdder V3 Pro": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Razer_DeathAdder_V2.jpg/440px-Razer_DeathAdder_V2.jpg",
  "SteelSeries Arctis Nova Pro Wireless": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/SteelSeries_Arctis_7.jpg/440px-SteelSeries_Arctis_7.jpg",
  "Corsair K100 RGB Mechanical Keyboard": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Corsair_K100_RGB.jpg/440px-Corsair_K100_RGB.jpg",
  "Garmin Fenix 7X Pro": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Garmin_Fenix_6_Pro.jpg/440px-Garmin_Fenix_6_Pro.jpg",
  "Fitbit Charge 6": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Fitbit_Charge_5.jpg/440px-Fitbit_Charge_5.jpg",
  "Garmin Venu 3": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Garmin_Venu_2.jpg/440px-Garmin_Venu_2.jpg",
  "Samsung Galaxy Watch 5 Pro": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Samsung_Galaxy_Watch5_Pro.png/440px-Samsung_Galaxy_Watch5_Pro.png",
  "Whoop 4.0": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/WHOOP_4.0.jpg/440px-WHOOP_4.0.jpg",
};

let updated = 0;
for (const [name, image] of Object.entries(EXACT_MAP)) {
  const result = await Product.updateMany(
    { name: { $regex: name.split(" ").slice(0, 3).join(" "), $options: "i" } },
    { $set: { image } }
  );
  if (result.modifiedCount > 0) {
    console.log(`✅ ${name} (${result.modifiedCount})`);
    updated += result.modifiedCount;
  } else {
    console.log(`⚠️  Not found: ${name}`);
  }
}
console.log(`\nDone. Updated ${updated} products.`);
await mongoose.disconnect();
