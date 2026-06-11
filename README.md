# 🛒 SmartCart: AI-Powered Price Intelligence

SmartCart is a comprehensive product discovery and price comparison platform. It aggregates real-time data from multiple marketplaces (Amazon, Flipkart, Google Shopping, Myntra, etc.) and uses AI to provide price forecasting, sentiment analysis, and smart buy recommendations.

## ✨ Features

- **Multi-Marketplace Search**: Unified search across Amazon, Flipkart, Google Shopping, RapidAPI, and more.
- **AI Price Intelligence**: Predictive models to forecast price trends (7-day and 30-day).
- **Buyer Sentiment Dashboard**: Real-time extraction of customer reviews and automated sentiment scoring.
- **Automated Price Tracking**: Background cron jobs that monitor prices every 6 hours and update historical records.
- **Visual Analytics**: Dynamic charts showing historical performance and forecast trajectories.
- **Responsive Premium UI**: Glassmorphism design with Dark/Light mode support.

## 🚀 Tech Stack

- **Frontend**: React (Vite), TailwindCSS, Recharts, Lucide Icons.
- **Backend**: Node.js, Express, MongoDB, Mongoose.
- **Automation**: Node-Cron, Puppeteer (Scrapers).
- **External APIs**: SerpAPI (Google Shopping), RapidAPI (Amazon/Flipkart/Unified Details).

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd SmartCart
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
SERPAPI_KEY=your_serpapi_key
RAPIDAPI_KEY=your_rapidapi_key
```

### 4. Seed the Database
```bash
node scripts/seedProducts.js
```

### 5. Run the Application
```bash
# Start both Backend and Frontend
npm run dev:all
```

## 📸 Screenshots
*(Add your screenshots here)*

## 📄 License
MIT

## Deployed Site
https://smartcart-t7jw.onrender.com/
