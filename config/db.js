require("dotenv").config();
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: parseInt(process.env.MYSQL_PORT),
});

if (process.env.NODE_ENV === "production") {
  // required for the connection to the production MySQL database.
  config = { ...config, socketPath: process.env.INSTANCE_UNIX_SOCKET };
}

module.exports = pool.promise();
