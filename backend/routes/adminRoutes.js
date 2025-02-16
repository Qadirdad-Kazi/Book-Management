import express from 'express';
import { BackupService } from '../services/backupService.js';
import { Analytics } from '../models/analyticsModel.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();
const backupService = new BackupService();

// Middleware to ensure user is admin
router.use(authenticateToken, authorizeAdmin);

// Create backup
router.post('/backup', async (req, res) => {
  try {
    const result = await backupService.createBackup();
    res.json(result);
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ message: 'Error creating backup' });
  }
});

// Restore from backup
router.post('/backup/restore', async (req, res) => {
  try {
    const { backupPath } = req.body;
    const result = await backupService.restoreFromBackup(backupPath);
    res.json(result);
  } catch (error) {
    console.error('Error restoring from backup:', error);
    res.status(500).json({ message: 'Error restoring from backup' });
  }
});

// List backups
router.get('/backups', async (req, res) => {
  try {
    const backups = await backupService.listBackups();
    res.json(backups);
  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({ message: 'Error listing backups' });
  }
});

// Schedule backup
router.post('/backup/schedule', async (req, res) => {
  try {
    const { cronExpression } = req.body;
    const result = await backupService.scheduleBackup(cronExpression);
    res.json(result);
  } catch (error) {
    console.error('Error scheduling backup:', error);
    res.status(500).json({ message: 'Error scheduling backup' });
  }
});

// Get system metrics
router.get('/metrics/system', async (req, res) => {
  try {
    const analytics = await Analytics.findOne();
    const metrics = analytics?.systemMetrics || [];
    res.json(metrics);
  } catch (error) {
    console.error('Error getting system metrics:', error);
    res.status(500).json({ message: 'Error getting system metrics' });
  }
});

// Get user metrics
router.get('/metrics/users', async (req, res) => {
  try {
    const analytics = await Analytics.findOne();
    const metrics = analytics?.userMetrics || [];
    res.json(metrics);
  } catch (error) {
    console.error('Error getting user metrics:', error);
    res.status(500).json({ message: 'Error getting user metrics' });
  }
});

// Get book metrics
router.get('/metrics/books', async (req, res) => {
  try {
    const analytics = await Analytics.findOne();
    const metrics = analytics?.bookMetrics || [];
    res.json(metrics);
  } catch (error) {
    console.error('Error getting book metrics:', error);
    res.status(500).json({ message: 'Error getting book metrics' });
  }
});

// Get error logs
router.get('/logs/errors', async (req, res) => {
  try {
    const analytics = await Analytics.findOne();
    const errors = analytics?.errors || [];
    res.json(errors);
  } catch (error) {
    console.error('Error getting error logs:', error);
    res.status(500).json({ message: 'Error getting error logs' });
  }
});

// Clear error logs
router.delete('/logs/errors', async (req, res) => {
  try {
    await Analytics.updateOne({}, { $set: { errors: [] } });
    res.json({ message: 'Error logs cleared successfully' });
  } catch (error) {
    console.error('Error clearing error logs:', error);
    res.status(500).json({ message: 'Error clearing error logs' });
  }
});

export default router;
