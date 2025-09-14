-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  progress INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, subject)
);

-- Study sessions
CREATE TABLE IF NOT EXISTS study_sessions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  duration INTEGER NOT NULL,
  focus_score DECIMAL(3,2),
  subject VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz results
CREATE TABLE IF NOT EXISTS quiz_results (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  score INTEGER NOT NULL,
  answers JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Team collaboration
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  team_id INTEGER REFERENCES teams(id),
  user_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY(team_id, user_id)
);
