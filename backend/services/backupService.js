import { Book } from '../models/bookModel.js';
import { User } from '../models/userModel.js';
import { Analytics } from '../models/analyticsModel.js';
import fs from 'fs/promises';
import path from 'path';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

export class BackupService {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    this.bucketName = process.env.AWS_BACKUP_BUCKET;
  }

  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(process.cwd(), 'backups');
      const backupPath = path.join(backupDir, \`backup-\${timestamp}.json.gz\`);

      // Ensure backup directory exists
      await fs.mkdir(backupDir, { recursive: true });

      // Fetch all data
      const [books, users, analytics] = await Promise.all([
        Book.find({}),
        User.find({}).select('-password'),
        Analytics.find({})
      ]);

      const backupData = {
        timestamp,
        books,
        users,
        analytics,
        metadata: {
          version: '1.0',
          totalBooks: books.length,
          totalUsers: users.length
        }
      };

      // Write to file with compression
      await this.compressAndSave(backupData, backupPath);

      // Upload to S3
      if (process.env.AWS_BACKUP_BUCKET) {
        await this.uploadToS3(backupPath, \`backup-\${timestamp}.json.gz\`);
      }

      // Update analytics
      await Analytics.findOneAndUpdate(
        {},
        {
          $push: {
            backups: {
              timestamp: new Date(timestamp),
              location: process.env.AWS_BACKUP_BUCKET ? 's3' : 'local',
              size: (await fs.stat(backupPath)).size,
              status: 'completed'
            }
          }
        },
        { upsert: true }
      );

      return {
        success: true,
        path: backupPath,
        timestamp
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      
      // Log failed backup attempt
      await Analytics.findOneAndUpdate(
        {},
        {
          $push: {
            backups: {
              timestamp: new Date(),
              status: 'failed',
              error: error.message
            }
          }
        },
        { upsert: true }
      );

      throw error;
    }
  }

  async restoreFromBackup(backupPath) {
    try {
      const data = await this.readAndDecompress(backupPath);
      const backupData = JSON.parse(data);

      // Validate backup data
      this.validateBackupData(backupData);

      // Clear existing data
      await Promise.all([
        Book.deleteMany({}),
        User.deleteMany({}),
        Analytics.deleteMany({})
      ]);

      // Restore data
      await Promise.all([
        Book.insertMany(backupData.books),
        User.insertMany(backupData.users),
        Analytics.insertMany(backupData.analytics)
      ]);

      return {
        success: true,
        timestamp: backupData.timestamp,
        metadata: backupData.metadata
      };
    } catch (error) {
      console.error('Error restoring from backup:', error);
      throw error;
    }
  }

  async compressAndSave(data, filePath) {
    const gzip = createGzip();
    const source = Buffer.from(JSON.stringify(data));
    const destination = createWriteStream(filePath);

    await pipeline(
      source,
      gzip,
      destination
    );
  }

  async readAndDecompress(filePath) {
    const source = createReadStream(filePath);
    const gzip = createGzip();
    let data = '';

    for await (const chunk of source.pipe(gzip)) {
      data += chunk;
    }

    return data;
  }

  async uploadToS3(filePath, key) {
    try {
      const fileStream = createReadStream(filePath);
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileStream
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  }

  async downloadFromS3(key, localPath) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      const response = await this.s3Client.send(command);
      const fileStream = createWriteStream(localPath);

      await pipeline(
        response.Body,
        fileStream
      );
    } catch (error) {
      console.error('Error downloading from S3:', error);
      throw error;
    }
  }

  validateBackupData(data) {
    const requiredFields = ['timestamp', 'books', 'users', 'analytics', 'metadata'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      throw new Error(\`Invalid backup data. Missing fields: \${missingFields.join(', ')}\`);
    }

    if (!Array.isArray(data.books) || !Array.isArray(data.users) || !Array.isArray(data.analytics)) {
      throw new Error('Invalid backup data structure');
    }
  }

  async scheduleBackup(cronExpression) {
    // Implementation for scheduled backups
    // This would typically use a job scheduler like node-cron
    // For now, we'll just create a backup
    return this.createBackup();
  }

  async listBackups() {
    try {
      const analytics = await Analytics.findOne();
      return analytics?.backups || [];
    } catch (error) {
      console.error('Error listing backups:', error);
      throw error;
    }
  }
}
