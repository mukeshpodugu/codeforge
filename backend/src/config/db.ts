import mongoose from 'mongoose';

export let isMongoConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/codeforge';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000 // Try for 3 seconds, then fail-over to JSON file
    });
    isMongoConnected = true;
    console.log('MongoDB Connected successfully!');
  } catch (error: any) {
    console.warn(`MongoDB Connection failed: "${error.message}". Using local JSON file database fallback!`);
    isMongoConnected = false;
  }
};
