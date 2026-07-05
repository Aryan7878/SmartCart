/**
 * fix-images.mjs
 * Replaces broken Wikimedia hotlinked images with reliable working image URLs.
 * Run: node scripts/fix-images.mjs
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/product.model.js';

dotenv.config();

// Map of product name keywords → working image URL
// Using i.rtings.com, gsmarena CDN, or official press-kit style images
// that allow hotlinking, or stable CDN sources
const IMAGE_MAP = {
  'iphone 15 pro max':   'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg',
  'iphone 15 -':         'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg',
  'iphone 13':           'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg',
  'samsung galaxy s24 ultra': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g.jpg',
  'samsung galaxy z fold 5':  'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg',
  'samsung galaxy a54':       'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a54.jpg',
  'samsung galaxy buds 2 pro':'https://images.samsung.com/is/image/samsung/p6pim/in/2209/gallery/in-galaxy-buds2-pro-r510-sm-r510nlvains-thumb-533941376',
  'samsung galaxy watch 6 classic': 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-watch6-classic.jpg',
  'samsung galaxy watch 5 pro':     'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-watch5-pro.jpg',
  'google pixel 8 pro':  'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg',
  'google pixel 7a':     'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7a.jpg',
  'google pixel watch 2':'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-watch-2.jpg',
  'oneplus 12':          'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg',
  'nothing phone (2)':   'https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-2-.jpg',
  'nothing ear (2)':     'https://fdn2.gsmarena.com/vv/bigpic/nothing-ear-2-.jpg',
  'sony wh-1000xm5':     'https://m.media-amazon.com/images/I/61mBXlXCHzL._AC_SL1500_.jpg',
  'sony wf-1000xm5':     'https://m.media-amazon.com/images/I/61Q7pGFhGsL._AC_SL1500_.jpg',
  'apple airpods pro':   'https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg',
  'apple airpods (3rd':  'https://m.media-amazon.com/images/I/71bhWgQK-cL._AC_SL1500_.jpg',
  'bose quietcomfort ultra': 'https://m.media-amazon.com/images/I/41Cq1mBtGnL._AC_SL1500_.jpg',
  'sennheiser momentum 4':   'https://m.media-amazon.com/images/I/51aNBqJJwPL._AC_SL1500_.jpg',
  'beats studio pro':        'https://m.media-amazon.com/images/I/71Cw5bm9jOL._AC_SL1500_.jpg',
  'jabra elite 8 active':    'https://m.media-amazon.com/images/I/51TKDKBNJZL._AC_SL1500_.jpg',
  'macbook pro 16':          'https://m.media-amazon.com/images/I/61bX2AoGj+L._AC_SL1500_.jpg',
  'macbook air 15':          'https://m.media-amazon.com/images/I/71vFKBpKakL._AC_SL1500_.jpg',
  'macbook air m1':          'https://m.media-amazon.com/images/I/71TPda7cwUL._AC_SL1500_.jpg',
  'dell xps 15':             'https://m.media-amazon.com/images/I/91CHkLVrLML._AC_SL1500_.jpg',
  'asus rog zephyrus g14':   'https://m.media-amazon.com/images/I/81bzDjjdMBL._AC_SL1500_.jpg',
  'hp spectre x360':         'https://m.media-amazon.com/images/I/71Fkg4KUZBL._AC_SL1500_.jpg',
  'lenovo thinkpad x1':      'https://m.media-amazon.com/images/I/71JJWEfuHFL._AC_SL1500_.jpg',
  'acer swift 3':            'https://m.media-amazon.com/images/I/71DVhMdklCL._AC_SL1500_.jpg',
  'razer blade 15':          'https://m.media-amazon.com/images/I/71h0gUdkJBL._AC_SL1500_.jpg',
  'microsoft surface laptop 5': 'https://m.media-amazon.com/images/I/71UJiYfWtEL._AC_SL1500_.jpg',
  'playstation 5':           'https://m.media-amazon.com/images/I/51051FiD9UL._AC_SL1500_.jpg',
  'xbox series x':           'https://m.media-amazon.com/images/I/51TbNnWevuL._AC_SL1500_.jpg',
  'nintendo switch oled':    'https://m.media-amazon.com/images/I/61dS4JnFmLL._AC_SL1500_.jpg',
  'steam deck oled':         'https://m.media-amazon.com/images/I/61NVnKSuSYL._AC_SL1500_.jpg',
  'meta quest 3':            'https://m.media-amazon.com/images/I/518YvRSGxhL._AC_SL1500_.jpg',
  'asus rog ally':           'https://m.media-amazon.com/images/I/71M3--YCQzL._AC_SL1500_.jpg',
  'razer deathadder v3 pro': 'https://m.media-amazon.com/images/I/71n4PGbz+5L._AC_SL1500_.jpg',
  'steelseries arctis nova pro': 'https://m.media-amazon.com/images/I/71Lk4Sg0xZL._AC_SL1500_.jpg',
  'corsair k100':            'https://m.media-amazon.com/images/I/71MvhcCEHIL._AC_SL1500_.jpg',
  'sony dualsense':          'https://m.media-amazon.com/images/I/51LBCh7ABKL._AC_SL1500_.jpg',
  'apple watch ultra 2':     'https://m.media-amazon.com/images/I/71lTWFVzO+L._AC_SL1500_.jpg',
  'apple watch series 9':    'https://m.media-amazon.com/images/I/61SPoGOGHFL._AC_SL1500_.jpg',
  'apple watch se':          'https://m.media-amazon.com/images/I/61JzHBuME+L._AC_SL1500_.jpg',
  'garmin fenix 7x':         'https://m.media-amazon.com/images/I/61w7GkCfSML._AC_SL1500_.jpg',
  'garmin venu 3':           'https://m.media-amazon.com/images/I/61kJuBJPbXL._AC_SL1500_.jpg',
  'fitbit charge 6':         'https://m.media-amazon.com/images/I/61MXrH6Wr5L._AC_SL1500_.jpg',
  'whoop 4.0':               'https://m.media-amazon.com/images/I/71e7kFkdxDL._AC_SL1500_.jpg',
};

const FALLBACK = 'https://m.media-amazon.com/images/I/41nRDGiDvLL._AC_SL1500_.jpg';

function findImage(name) {
  const lower = name.toLowerCase();
  for (const [keyword, url] of Object.entries(IMAGE_MAP)) {
    if (lower.includes(keyword.toLowerCase())) return url;
  }
  return FALLBACK;
}

async function fixImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const products = await Product.find({}, '_id name image');
    console.log(`Found ${products.length} products to update.\n`);

    let updated = 0;
    for (const p of products) {
      const newImage = findImage(p.name);
      if (p.image !== newImage) {
        await Product.findByIdAndUpdate(p._id, { image: newImage });
        console.log(`✅ ${p.name}\n   → ${newImage}\n`);
        updated++;
      } else {
        console.log(`⏭️  ${p.name} — already OK`);
      }
    }
    console.log(`\n✨ Done! Updated ${updated}/${products.length} products.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

fixImages();
