// db.js
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'my_app',
  port: process.env.DB_NAMEDB_NAME ? Number(process.env.DB_PORT) : 3306,
});

export const db = drizzle(pool);
