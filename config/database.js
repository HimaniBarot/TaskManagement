const { MongoClient } = require('mongodb');
require('dotenv').config();

// Connection details
const uri = process.env.MONGO_URI;
const dbName = process.env.DATABASE_NAME;

// Create a new MongoClient instance
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected successfully to MongoDB');

    return client.db(dbName);

  } catch (error) {
    console.error('An error occurred connecting to MongoDB:', error);
  } 
  // finally {
  //   // Close the connection to the MongoDB server
  //   await client.close();
  //   console.log('Connection closed');
  // }
}

module.exports = { connectToDatabase };