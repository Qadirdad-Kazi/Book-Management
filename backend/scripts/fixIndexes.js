import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

async function fixIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Drop the problematic index
    await usersCollection.dropIndex('username_1');
    console.log('✅ Successfully dropped username index');

    // List remaining indexes
    const indexes = await usersCollection.indexes();
    console.log('Current indexes:', indexes);

  } catch (error) {
    if (error.code === 27) {
      console.log('Index username_1 does not exist - this is fine');
    } else {
      console.error('❌ Error:', error);
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixIndexes();
