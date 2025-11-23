import { pool } from '../connection';

async function resetDb() {
  await pool.query(`
    DROP TABLE IF EXISTS poem_tags;
    DROP TABLE IF EXISTS poems;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS tags;
    DROP TABLE IF EXISTS personalities;
    DROP TABLE IF EXISTS avatars;

    DROP TABLE IF EXISTS migrations;
  `);
  console.log('✅ Database reseted!');
  process.exit(0);
}

resetDb();
