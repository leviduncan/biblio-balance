import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
    console.log('🔍 Testing Postgres Connection...\n');

    const connectionString = process.env.DATABASE_URL;
    console.log(`📍 Connection string: ${connectionString?.replace(/:[^:]*@/, ':****@')}\n`);

    const client = new Client({
        connectionString,
        connectionTimeoutMillis: 5000,
    });

    try {
        console.log('⏳ Attempting to connect...');
        await client.connect();

        console.log('✅ Connected successfully!');

        // Test query
        const result = await client.query('SELECT NOW()');
        console.log('✅ Query successful! Current time:', result.rows[0].now);

        // Check if database exists
        const dbCheck = await client.query("SELECT datname FROM pg_database WHERE datname = $1", [process.env.DATABASE_URL?.split('/').pop()]);
        if (dbCheck.rows.length > 0) {
            console.log('✅ Database exists');
        } else {
            console.log('⚠️  Database might not exist yet');
        }

    } catch (error: any) {
        console.error('❌ Connection failed!');
        console.error('Error:', error.message);
        console.error('\n🔧 Troubleshooting tips:');
        console.error('1. Verify Postgres server is running at 5.161.252.91:5050');
        console.error('2. Check firewall rules allow port 5050');
        console.error('3. Verify username/password are correct');
        console.error('4. Ensure database "bt-backend" exists');
        console.error('\nFull error:', error);
    } finally {
        await client.end();
    }
};

testConnection();
