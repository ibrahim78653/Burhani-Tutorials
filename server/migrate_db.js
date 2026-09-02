const mongoose = require('mongoose');

const localUri = 'mongodb://127.0.0.1:27017/burhani_tutorials';
const remoteUri = 'mongodb://coderibrahim786_db_user:2nXyj0dx8Y4flyJz@ac-wtm763o-shard-00-00.hhad4uo.mongodb.net:27017,ac-wtm763o-shard-00-01.hhad4uo.mongodb.net:27017,ac-wtm763o-shard-00-02.hhad4uo.mongodb.net:27017/burhani_tutorials?ssl=true&replicaSet=atlas-wtm763o-shard-0&authSource=admin&retryWrites=true&w=majority';

async function migrate() {
  console.log('Connecting to local DB...');
  const localConn = await mongoose.createConnection(localUri).asPromise();
  
  console.log('Connecting to remote DB...');
  const remoteConn = await mongoose.createConnection(remoteUri).asPromise();

  console.log('Fetching collections from local DB...');
  const collections = await localConn.db.listCollections().toArray();
  
  if (collections.length === 0) {
    console.log('No collections found in local DB. Nothing to migrate.');
  }

  for (const collInfo of collections) {
    const collName = collInfo.name;
    // Skip system collections
    if (collName.startsWith('system.')) continue;
    
    console.log(`Copying collection: ${collName}...`);
    
    const localCollection = localConn.db.collection(collName);
    const remoteCollection = remoteConn.db.collection(collName);

    // Get all docs
    const docs = await localCollection.find({}).toArray();
    
    if (docs.length > 0) {
      // Clear remote collection first to avoid duplicate keys during testing
      await remoteCollection.deleteMany({});
      
      // Insert into remote
      await remoteCollection.insertMany(docs);
      console.log(`  -> Copied ${docs.length} documents for ${collName}`);
    } else {
      console.log(`  -> Skipped ${collName} (0 documents)`);
    }
  }

  console.log('Migration completed successfully!');
  await localConn.close();
  await remoteConn.close();
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
