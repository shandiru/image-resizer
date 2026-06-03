import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/image-optimizer';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Analytics Schema (lightweight - no images stored)
const analyticsSchema = new mongoose.Schema({
  imageCount: { type: Number, required: true },
  originalSize: { type: Number, required: true },
  optimizedSize: { type: Number, required: true },
  savedBytes: { type: Number, required: true },
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

// API Routes

// Log processing session
app.post('/api/analytics/log', async (req, res) => {
  try {
    const { imageCount, originalSize, optimizedSize, savedBytes } = req.body;

    if (!imageCount || !originalSize || !optimizedSize) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const analytics = new Analytics({
      imageCount,
      originalSize,
      optimizedSize,
      savedBytes: savedBytes || (originalSize - optimizedSize),
      userAgent: req.headers['user-agent']
    });

    await analytics.save();
    res.status(201).json({ message: 'Logged successfully', id: analytics._id });
  } catch (error) {
    console.error('Error logging analytics:', error);
    res.status(500).json({ error: 'Failed to log analytics' });
  }
});

// Get session statistics
app.get('/api/analytics/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayStats, totalStats, recentSessions] = await Promise.all([
      Analytics.aggregate([
        { $match: { timestamp: { $gte: today } } },
        {
          $group: {
            _id: null,
            totalImages: { $sum: '$imageCount' },
            totalOriginalSize: { $sum: '$originalSize' },
            totalOptimizedSize: { $sum: '$optimizedSize' },
            totalSavedBytes: { $sum: '$savedBytes' },
            sessionCount: { $sum: 1 }
          }
        }
      ]),
      Analytics.aggregate([
        {
          $group: {
            _id: null,
            totalImages: { $sum: '$imageCount' },
            totalOriginalSize: { $sum: '$originalSize' },
            totalOptimizedSize: { $sum: '$optimizedSize' },
            totalSavedBytes: { $sum: '$savedBytes' },
            sessionCount: { $sum: 1 }
          }
        }
      ]),
      Analytics.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .select('imageCount originalSize optimizedSize savedBytes timestamp')
    ]);

    const todayData = todayStats[0] || {
      totalImages: 0,
      totalOriginalSize: 0,
      totalOptimizedSize: 0,
      totalSavedBytes: 0,
      sessionCount: 0
    };

    const totalData = totalStats[0] || {
      totalImages: 0,
      totalOriginalSize: 0,
      totalOptimizedSize: 0,
      totalSavedBytes: 0,
      sessionCount: 0
    };

    res.json({
      today: {
        images: todayData.totalImages,
        originalSize: todayData.totalOriginalSize,
        optimizedSize: todayData.totalOptimizedSize,
        savedBytes: todayData.totalSavedBytes,
        savedPercentage: todayData.totalOriginalSize
          ? ((todayData.totalSavedBytes / todayData.totalOriginalSize) * 100).toFixed(1)
          : 0,
        sessions: todayData.sessionCount
      },
      allTime: {
        images: totalData.totalImages,
        originalSize: totalData.totalOriginalSize,
        optimizedSize: totalData.totalOptimizedSize,
        savedBytes: totalData.totalSavedBytes,
        savedPercentage: totalData.totalOriginalSize
          ? ((totalData.totalSavedBytes / totalData.totalOriginalSize) * 100).toFixed(1)
          : 0,
        sessions: totalData.sessionCount
      },
      recentSessions: recentSessions.map(s => ({
        images: s.imageCount,
        savedBytes: s.savedBytes,
        timestamp: s.timestamp
      }))
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;