import { neon } from '@netlify/neon';

const sql = neon(); // Uses NETLIFY_DATABASE_URL env variable

export const db = {
  // User progress tracking
  async getUserProgress(userId) {
    const [user] = await sql`SELECT * FROM user_progress WHERE user_id = ${userId}`;
    return user;
  },

  async updateProgress(userId, subject, progress) {
    await sql`
      INSERT INTO user_progress (user_id, subject, progress, updated_at)
      VALUES (${userId}, ${subject}, ${progress}, NOW())
      ON CONFLICT (user_id, subject) 
      DO UPDATE SET progress = ${progress}, updated_at = NOW()
    `;
  },

  // Study sessions
  async saveSession(userId, sessionData) {
    const [session] = await sql`
      INSERT INTO study_sessions (user_id, duration, focus_score, subject, created_at)
      VALUES (${userId}, ${sessionData.duration}, ${sessionData.focusScore}, ${sessionData.subject}, NOW())
      RETURNING id
    `;
    return session.id;
  },

  // Quiz results
  async saveQuizResult(userId, subject, score, answers) {
    await sql`
      INSERT INTO quiz_results (user_id, subject, score, answers, created_at)
      VALUES (${userId}, ${subject}, ${score}, ${JSON.stringify(answers)}, NOW())
    `;
  }
};
