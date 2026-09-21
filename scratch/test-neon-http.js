const { neon } = require('@neondatabase/serverless');

async function testHttp() {
  console.log('Testing Neon HTTP query (Port 443 HTTPS)...');
  const sql = neon("postgresql://neondb_owner:npg_USxT0fLt6Eqp@ep-damp-poetry-apywl4a9-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require");
  try {
    const response = await sql`SELECT 1 as connected`;
    console.log('HTTP Query Success over HTTPS (Port 443):', response);
  } catch (e) {
    console.error('HTTP Query Error:', e.message);
  }
}

testHttp();
