import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js";
dotenv.config();
await mongoose.connect(process.env.MONGO_URI);
const r = await Product.updateMany(
  { name: { $regex: "Nothing Ear", $options: "i" } },
  { $set: { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Nothing_Ear_%281%29.png/440px-Nothing_Ear_%281%29.png" } }
);
console.log("Updated Nothing Ear:", r.modifiedCount);
await mongoose.disconnect();
