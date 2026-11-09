const app = require('./app');
const { initializeDatabase, pool } = require('./db');

const port = Number(process.env.PORT || 3000);
async function start() {
  let delay = 1000;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try { await initializeDatabase(); break; }
    catch (error) {
      if (attempt === 30) throw error;
      console.log(`Database not ready (attempt ${attempt}/30); retrying in ${delay}ms.`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 1.5, 5000);
    }
  }
  app.listen(port, '0.0.0.0', () => console.log(`VISIO listening on port ${port}`));
}
start().catch(async (error) => { console.error('Could not initialize VISIO database:', error); await pool.end(); process.exit(1); });
