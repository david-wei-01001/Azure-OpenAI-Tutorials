require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main() { 
    // initialize the MongoDB client
    const client = new MongoClient(process.env.MONGODB_URI);
    
    // connects to the database service and outputs messages to the console to indicate the connection status.
    try {
        await client.connect();
        console.log('Connected to MongoDB');
      } catch (err) {
        console.error(err);
      } finally {
        await client.close();
        console.log('Disconnected from MongoDB');
      }
}

main().catch(console.error);
