/**
 * MongoDB connection (Mongoose).
 * Call connectMongo() once at server startup before handling requests.
 */
const mongoose = require('mongoose');

let isConnected = false;

async function connectMongo() {
  if (isConnected) return mongoose.connection;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to backend/.env (see .env.example).');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    // Mongoose 7+ no longer needs useNewUrlParser/useUnifiedTopology, kept here as no-ops
    // for compatibility with older mongoose versions if downgraded.
  });

  isConnected = true;
  console.log('[mongo] Connected to MongoDB');

  mongoose.connection.on('error', (err) => {
    console.error('[mongo] Connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[mongo] Disconnected from MongoDB');
    isConnected = false;
  });

  return mongoose.connection;
}

module.exports = { connectMongo, mongoose };
