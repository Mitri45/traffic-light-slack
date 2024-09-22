const createTlSettingsTable = `
CREATE TABLE IF NOT EXISTS tl_settings (
  team_id TEXT PRIMARY KEY,
  question TEXT,
  timeout INTEGER CHECK (timeout >= 0 AND timeout <= 100),
  first_button_text TEXT,
  first_button_emoji TEXT,
  second_button_text TEXT,
  second_button_emoji TEXT,
  third_button_text TEXT,
  third_button_emoji TEXT,
  updated_at TEXT,
  updated_by TEXT
);
`;

module.exports = { createTlSettingsTable };
