import { Analytics } from '../models/analyticsModel.js';
import os from 'os';

// Collect system metrics every 5 minutes
const METRICS_INTERVAL = 5 * 60 * 1000;

export const initializeAnalytics = async () => {
  let analytics = await Analytics.findOne();
  if (!analytics) {
    analytics = new Analytics();
    await analytics.save();
  }

  // Start collecting metrics
  setInterval(async () => {
    try {
      const cpuUsage = os.loadavg()[0];
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      
      const metrics = {
        cpu: {
          usage: cpuUsage,
          temperature: null // Would require additional library for hardware info
        },
        memory: {
          total: totalMemory,
          used: totalMemory - freeMemory,
          free: freeMemory
        },
        requests: {
          total: global.requestMetrics?.total || 0,
          successful: global.requestMetrics?.successful || 0,
          failed: global.requestMetrics?.failed || 0
        }
      };

      analytics.systemMetrics.push(metrics);
      await analytics.save();

      // Reset request metrics
      global.requestMetrics = {
        total: 0,
        successful: 0,
        failed: 0
      };
    } catch (error) {
      console.error('Error collecting system metrics:', error);
    }
  }, METRICS_INTERVAL);

  // Calculate daily metrics at midnight
  const scheduleDailyMetrics = () => {
    const now = new Date();
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // tomorrow
      0, 0, 0 // midnight
    );
    const msToMidnight = night.getTime() - now.getTime();

    setTimeout(async () => {
      try {
        await analytics.calculateDailyMetrics();
        scheduleDailyMetrics(); // Schedule next run
      } catch (error) {
        console.error('Error calculating daily metrics:', error);
        scheduleDailyMetrics(); // Retry tomorrow
      }
    }, msToMidnight);
  };

  scheduleDailyMetrics();
};

// Middleware to track request metrics
export const trackRequest = async (req, res, next) => {
  const start = Date.now();

  // Initialize global request metrics if not exists
  global.requestMetrics = global.requestMetrics || {
    total: 0,
    successful: 0,
    failed: 0
  };

  // Count total requests
  global.requestMetrics.total++;

  // Track response
  res.on('finish', async () => {
    const duration = Date.now() - start;

    // Track successful/failed requests
    if (res.statusCode < 400) {
      global.requestMetrics.successful++;
    } else {
      global.requestMetrics.failed++;
    }

    // Log errors
    if (res.statusCode >= 400) {
      try {
        const analytics = await Analytics.findOne();
        analytics.errors.push({
          code: res.statusCode.toString(),
          message: res.statusMessage,
          endpoint: req.originalUrl,
          userId: req.user?._id
        });
        await analytics.save();
      } catch (error) {
        console.error('Error logging analytics error:', error);
      }
    }
  });

  next();
};

// Middleware to track user activity
export const trackUserActivity = async (req, res, next) => {
  if (req.user) {
    try {
      const actionMap = {
        POST: 'ADD',
        PUT: 'UPDATE',
        DELETE: 'DELETE'
      };

      const baseAction = actionMap[req.method];
      if (baseAction && req.originalUrl.includes('/api/books')) {
        const action = \`\${baseAction}_BOOK\`;
        req.user.activityLog.push({
          action,
          bookId: req.params.id,
          details: {
            method: req.method,
            url: req.originalUrl
          }
        });
        await req.user.save();
      }
    } catch (error) {
      console.error('Error tracking user activity:', error);
    }
  }
  next();
};
