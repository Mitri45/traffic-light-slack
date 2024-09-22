const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/db.sqlite3");
const { createTlSettingsTable } = require("./schema");

const initDb = () => {
	db.serialize(() => {
		db.run(createTlSettingsTable);
	});
	console.log("Database initialized");
};

const upsertTlSettings = (options) => {
	const {
		team_id,
		question = "How confident are you in achieving our sprint goals?",
		timeout = 10,
		first_button_text = "On track",
		first_button_emoji = ":white_check_mark:",
		second_button_text = "Uncertain",
		second_button_emoji = ":warning:",
		third_button_text = "At Risk",
		third_button_emoji = ":fire:",
		updated_at,
		updated_by,
	} = options;

	db.serialize(() => {
		const stmt = db.prepare(`
			INSERT INTO tl_settings (team_id, question, timeout, first_button_text, first_button_emoji, second_button_text, second_button_emoji, third_button_text, third_button_emoji, updated_at, updated_by)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			ON CONFLICT(team_id) DO UPDATE SET
			question = excluded.question,
			timeout = excluded.timeout,
			first_button_text = excluded.first_button_text,
			first_button_emoji = excluded.first_button_emoji,
			second_button_text = excluded.second_button_text,
			second_button_emoji = excluded.second_button_emoji,
			third_button_text = excluded.third_button_text,
			third_button_emoji = excluded.third_button_emoji,
			updated_at = excluded.updated_at,
			updated_by = excluded.updated_by;
		`);
		stmt.run(
			team_id,
			question,
			timeout,
			first_button_text,
			first_button_emoji,
			second_button_text,
			second_button_emoji,
			third_button_text,
			third_button_emoji,
			updated_at,
			updated_by,
		);
		stmt.finalize();
	});
};

const getTlSettings = (team_id = "default") => {
	return new Promise((resolve, reject) => {
		db.serialize(() => {
			db.get(
				"SELECT * FROM tl_settings WHERE team_id = ?",
				[team_id],
				(err, row) => {
					if (err) {
						reject(err);
					}
					resolve(row);
				},
			);
		});
	});
};

module.exports = { initDb, upsertTlSettings, getTlSettings };
