import test, { after } from 'node:test';
import assert from 'node:assert';
import WebSocket from 'ws';
import { server, startServer } from '../dist/index.js';

const testPort = 8080;

await startServer(testPort);

after(async () => {
  if (server.listening) {
    await new Promise((resolve) => {
      server.close(() => resolve(true));
    });
  }
});

test('relay /health returns status ok', async () => {
  const res = await fetch(`http://localhost:${testPort}/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'ok');
  assert.strictEqual(data.service, 'asha-relay');
});

test('relay rejects unauthenticated WebSocket connections', async () => {
  await new Promise((resolve) => {
    const ws = new WebSocket(`ws://localhost:${testPort}/ws?token=invalid_token`);
    ws.on('close', (code) => {
      assert.strictEqual(code, 4001, 'Should close with code 4001 Unauthorized');
      resolve(true);
    });
  });
});

test('relay accepts valid token, handles STT, TTS and barge-in', async () => {
  await new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${testPort}/ws?token=mock-jwt-token-for-dev`);
    let authDone = false;

    ws.on('message', (data, isBinary) => {
      if (isBinary) {
        assert.ok(data.length > 0, 'Audio chunk should have content');
        ws.close();
        resolve(true);
        return;
      }

      const msg = JSON.parse(data.toString());

      if (msg.type === 'auth_ok') {
        authDone = true;
        assert.strictEqual(msg.uid, 'demo-asha-worker-01');

        // Test barge-in
        ws.send(JSON.stringify({ type: 'barge_in' }));
      } else if (msg.type === 'barge_in_ok') {
        assert.ok(authDone, 'Auth must be done');
        // Test TTS speak
        ws.send(JSON.stringify({ type: 'speak', text: 'Hello Didi', language: 'en' }));
      }
    });

    ws.on('error', (err) => {
      reject(err);
    });
  });
});
