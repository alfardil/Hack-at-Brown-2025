import { MongoClient, ServerApiVersion } from "mongodb";

if (!process.env.MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable inside .env.local");
}
//tahmidccarrying
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
  serverSelectionTimeoutMS: 5000,
});

let conn: MongoClient;
try {
    conn = await client.connect();
}
catch (err) {
  console.error(err);
  throw new Error("Oopsies! Something went wrong with the connection to the database.");
}

const db = conn.db("pawandorder");

export {db};