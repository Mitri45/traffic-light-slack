const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("agile_poker.db");

// TODO: Add persistent store
const createTable = () => {
	db.close();
};

module.exports = { createTable };
