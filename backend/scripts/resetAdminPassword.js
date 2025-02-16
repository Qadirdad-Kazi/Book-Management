import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { User } from '../models/userModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

async function resetAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Find admin user
    const adminUser = await User.findOne({ email: 'qadirdadkazi@gmail.com' });
    
    if (!adminUser) {
      console.log('Admin user not found. Creating new admin user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Password1', salt);

      // Create admin user
      const newAdmin = new User({
        name: 'Qadirdad Kazi',
        email: 'qadirdadkazi@gmail.com',
        password: hashedPassword,
        role: 'admin'
      });

      await newAdmin.save();
      console.log('✅ Admin user created successfully');
    } else {
      console.log('Admin user found. Resetting password...');
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Password1', salt);
      
      // Update password
      adminUser.password = hashedPassword;
      await adminUser.save();
      
      console.log('✅ Admin password reset successfully');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

resetAdminPassword();
