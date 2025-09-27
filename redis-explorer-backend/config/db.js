import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

// Check connection
pool.connect()
  .then(() => {
    console.log("Connected to the PostgreSQL database.");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err.message);
  });

export default pool;
