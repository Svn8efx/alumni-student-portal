const mongoose = require('mongoose');

/**
 * Establishes a connection to MongoDB Atlas using the URI in the environment.
 * Exits the process on failure so that hosting platforms (Render) restart cleanly.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
