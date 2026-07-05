import { Client } from "pg";

const db = new Client(process.env.DATABASE_URL);

export default db;