const express = require('express');
const path = require('path');
const simulations = require('./routes/simulations');

const app = express();
app.use(express.json({ limit: '10kb' }));
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', service: 'visio-api' }));
app.use('/api/simulations', simulations);

const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));
app.get('*', (_req, res) => res.sendFile(path.join(frontendPath, 'index.html')));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.type === 'entity.parse.failed' ? 400 : 500).json({ error: error.type === 'entity.parse.failed' ? 'Request body must be valid JSON.' : 'Internal server error.' });
});

module.exports = app;
