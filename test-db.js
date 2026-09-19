import sql from 'mssql/msnodesqlv8.js';

const config = {
  server: 'localhost\\SQLEXPRESS', // Trying common SQL Express instance
  database: 'PhoenixGrid',
  driver: 'SQL Server Native Client 11.0',
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  }
};

async function test() {
  console.log('Testing connection...');
  try {
    const pool = await new sql.ConnectionPool(config).connect();
    console.log('SUCCESS: Connected to ' + config.server);
    process.exit(0);
  } catch(e) {
    console.log('FAILED SQLEXPRESS: ' + e.message);
    
    // Try without SQLEXPRESS and different driver
    const config2 = {
      server: 'localhost',
      database: 'PhoenixGrid',
      driver: 'ODBC Driver 17 for SQL Server',
      options: { trustedConnection: true, trustServerCertificate: true }
    };
    try {
      await new sql.ConnectionPool(config2).connect();
      console.log('SUCCESS: Connected to localhost');
      process.exit(0);
    } catch(e2) {
      console.log('FAILED LOCALHOST: ' + e2.message);
      process.exit(1);
    }
  }
}
test();
