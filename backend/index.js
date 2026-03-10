// 🔴 SABSE PEHLE - Environment variables load karo
const dotenv = require("dotenv");
dotenv.config();

// FIR baaki sab imports
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const agentRoutes = require('./routes/agentRoutes');
const uploadRoutes = require('./routes/upload');
const leadRoutes=require("./routes/leadRoutes");

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

connectDB();

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use('/api', agentRoutes);
app.use('/api/companyProfile', uploadRoutes);

app.use("/api/leads", leadRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});