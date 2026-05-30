import { Db, MongoClient } from 'mongodb';

const dbName = process.env.MONGODB_DB || 'morerec';

// В serverless-среде (Vercel) переиспользуем подключение между вызовами,
// чтобы не плодить коннекты на каждый запрос.
const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Не задана переменная окружения MONGODB_URI');
  }
  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  return globalWithMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}

export const RECORDS_COLLECTION = 'records';
