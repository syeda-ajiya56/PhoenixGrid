import sql from 'mssql/msnodesqlv8.js';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  server: 'localhost\\SQLEXPRESS',
  database: 'PhoenixGrid',
  driver: 'ODBC Driver 17 for SQL Server',
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  }
};

export const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL Database (Windows Auth): PhoenixGrid');
    return pool;
  })
  .catch(err => {
    console.log('Database Connection Failed! (But server will stay running): ', err.message);
  });

export { sql };
