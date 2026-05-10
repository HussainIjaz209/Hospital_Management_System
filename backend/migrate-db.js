const { MongoClient } = require('mongodb');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/hospital-db';
const ATLAS_URI = 'mongodb+srv://hijaz4981:Hussainijaz%40123@cluster0.w0431jt.mongodb.net/Hospital_management_system?retryWrites=true&w=majority&appName=Cluster0';

async function migrate() {
    const localClient = new MongoClient(LOCAL_URI);
    const atlasClient = new MongoClient(ATLAS_URI);

    try {
        console.log('Connecting to local database...');
        await localClient.connect();
        const localDb = localClient.db();

        console.log('Connecting to Atlas database...');
        await atlasClient.connect();
        const atlasDb = atlasClient.db();

        // Get all collections from local DB
        const collections = await localDb.listCollections().toArray();
        console.log(`Found ${collections.length} collections in local database.`);

        for (const col of collections) {
            const collectionName = col.name;
            console.log(`\nProcessing collection: ${collectionName}`);

            const localCollection = localDb.collection(collectionName);
            const atlasCollection = atlasDb.collection(collectionName);

            const documents = await localCollection.find({}).toArray();
            console.log(`Found ${documents.length} documents in local ${collectionName}.`);

            if (documents.length > 0) {
                // Clear the collection in Atlas before inserting to avoid duplicates if re-run
                await atlasCollection.deleteMany({});
                
                // Insert all documents
                await atlasCollection.insertMany(documents);
                console.log(`Successfully inserted ${documents.length} documents into Atlas ${collectionName}.`);
            } else {
                // If it's empty, we might want to just create the collection anyway
                await atlasDb.createCollection(collectionName).catch(err => {
                    // Ignore error if collection already exists
                    if (err.codeName !== 'NamespaceExists') {
                        console.log(`Error creating collection: ${err.message}`);
                    }
                });
                console.log(`Collection ${collectionName} checked/created (no data to insert).`);
            }
        }

        console.log('\nMigration completed successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await localClient.close();
        await atlasClient.close();
    }
}

migrate();
