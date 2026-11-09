const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

test('GET /health returns service status without a database connection', async () => {
  const server = app.listen(0);
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok', service: 'visio-api' });
  } finally { server.close(); }
});
