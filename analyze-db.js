const mongoose = require('mongoose');

// Get the connection string from .env file
require('dotenv').config();
const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(c => console.log(` - ${c.name}`));
    
    // Get sample documents from each collection
    for (const coll of collections) {
      const documents = await mongoose.connection.db.collection(coll.name).find().limit(1).toArray();
      if (documents.length > 0) {
        console.log(`\nSample document from ${coll.name}:`);
        console.log(JSON.stringify(documents[0], null, 2));
        
        // Get collection schema
        console.log(`\nSchema for ${coll.name}:`);
        const keys = Object.keys(documents[0]);
        keys.forEach(key => {
          const value = documents[0][key];
          const type = value === null ? 'null' : typeof value;
          console.log(` - ${key}: ${type} ${value instanceof Date ? '(Date)' : value instanceof mongoose.Types.ObjectId ? '(ObjectId)' : ''}`);
        });
      } else {
        console.log(`\nNo documents found in ${coll.name}`);
      }
    }
    
    mongoose.connection.close();
    console.log('\nConnection closed');
  })
  .catch(err => {
    console.error('Connection error:', err);
  });