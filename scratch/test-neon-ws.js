const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
neonConfig.webSocketConstructor = ws;

const dbUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_USxT0fLt6Eqp@ep-damp-poetry-apywl4a9-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function testWebSocket() {
  console.log('Testing Neon WebSocket pool connection...');
  try {
    const pool = new Pool({ connectionString: dbUrl });
    const res = await pool.query('SELECT 1 as connected');
    console.log('Neon WebSocket Connection Success:', res.rows);
    await pool.end();
  } catch (err) {
    console.error('Neon WebSocket Connection Error:', err.message);
  }
}

testWebSocket();
