const mysql = require('mysql2');

const db = mysql
  .createPool({
    host: 'localhost',
    user: 'root',
    password: '123',
    database: 'workshop'
  })
  .promise(); // <<< IMPORTANTE

module.exports = db;
