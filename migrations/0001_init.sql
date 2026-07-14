CREATE TABLE plans (
	token TEXT PRIMARY KEY,
	email TEXT NOT NULL,
	created_at TEXT NOT NULL,
	utc_offset_minutes INTEGER NOT NULL,
	enable_blt INTEGER NOT NULL,
	enable_melatonin INTEGER NOT NULL,
	goal_wake TEXT NOT NULL,
	goal_sleep TEXT NOT NULL,
	baseline_wake TEXT NOT NULL,
	baseline_sleep TEXT NOT NULL,
	baseline_date TEXT NOT NULL,
	unsubscribed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE checkins (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	plan_token TEXT NOT NULL REFERENCES plans(token),
	checkin_date TEXT NOT NULL,
	sent_at TEXT,
	responded_at TEXT,
	stuck_to_plan INTEGER,
	reported_bedtime TEXT,
	UNIQUE(plan_token, checkin_date)
);

CREATE INDEX idx_checkins_plan_token ON checkins(plan_token);
