import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { config } from './config.js';
import { verifyIdToken } from './auth.js';
import { userRateLimiter } from './rateLimit.js';
import { GnaniSttSession } from './gnaniStt.js';
import { GnaniTtsStreamer } from './gnaniTts.js';
import { extractRecord } from './extract.js';

const app = express();

const allowedOrigins = config.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
  })
);

app.use(express.json());

// GET /health
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'asha-relay',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// POST /extract
app.post('/extract', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  const auth = await verifyIdToken(token);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized token' });
  }

  const allowed = userRateLimiter.check(auth.uid);
  if (!allowed) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  const { transcript, beneficiaryType, currentRecord, language } = req.body;
  if (!transcript || typeof transcript !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing transcript' });
  }

  try {
    const result = await extractRecord({
      transcript,
      beneficiaryType,
      currentRecord,
      language,
    });
    return res.json(result);
  } catch (err: any) {
    console.error('Extraction error:', err);
    return res.status(500).json({ error: err.message || 'Internal extraction failure' });
  }
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

interface ClientSession {
  ws: WebSocket;
  userId: string | null;
  isAuthenticated: boolean;
  sttSession: GnaniSttSession | null;
  ttsStreamer: GnaniTtsStreamer | null;
  currentLanguage: string;
  speechEndTimestamp: number | null;
}

wss.on('connection', (ws: WebSocket, req) => {
  // Extract token from query param if provided: ws://.../ws?token=XYZ
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const queryToken = url.searchParams.get('token');

  const session: ClientSession = {
    ws,
    userId: null,
    isAuthenticated: false,
    sttSession: null,
    ttsStreamer: null,
    currentLanguage: 'en',
    speechEndTimestamp: null,
  };

  const authenticate = async (token: string) => {
    const verified = await verifyIdToken(token);
    if (!verified) {
      console.warn('❌ WebSocket connection rejected: Invalid or missing token');
      ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized: Invalid ID token' }));
      ws.close(4001, 'Unauthorized');
      return false;
    }

    session.userId = verified.uid;
    session.isAuthenticated = true;
    ws.send(JSON.stringify({ type: 'auth_ok', uid: verified.uid }));
    console.log(`✅ Client authenticated: ${verified.uid}`);
    return true;
  };

  // If token in URL, authenticate immediately
  if (queryToken) {
    authenticate(queryToken);
  } else {
    // Give 5 seconds for auth message
    setTimeout(() => {
      if (!session.isAuthenticated && ws.readyState === WebSocket.OPEN) {
        console.warn('Authentication timeout: closing socket');
        ws.send(JSON.stringify({ type: 'error', message: 'Authentication timeout' }));
        ws.close(4001, 'Unauthorized');
      }
    }, 5000);
  }

  ws.on('message', async (data: Buffer | string, isBinary: boolean) => {
    // Handle Binary Audio Stream (Client -> Relay)
    if (isBinary) {
      if (!session.isAuthenticated) return;
      if (session.sttSession && Buffer.isBuffer(data)) {
        session.sttSession.sendAudioChunk(data);
      }
      return;
    }

    // Handle JSON Control Messages
    try {
      const msg = JSON.parse(data.toString());

      // 1. Auth message
      if (msg.type === 'auth') {
        await authenticate(msg.token);
        return;
      }

      // Check authentication for all other actions
      if (!session.isAuthenticated) {
        ws.send(JSON.stringify({ type: 'error', message: 'Please authenticate first' }));
        return;
      }

      // Rate limit check
      if (session.userId && !userRateLimiter.check(session.userId)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Rate limit exceeded. Please wait a moment.' }));
        return;
      }

      // 2. Start STT session
      if (msg.type === 'start') {
        const lang = msg.language || 'en';
        session.currentLanguage = lang;

        // Teardown any existing STT session
        if (session.sttSession) {
          session.sttSession.stop();
        }

        session.sttSession = new GnaniSttSession({
          language: lang,
          onPartial: (partialText) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'partial', text: partialText }));
            }
          },
          onFinal: (finalText) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'final', text: finalText }));
            }
          },
          onError: (err) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'error', message: err.message }));
            }
          },
        });

        session.sttSession.connect();
        ws.send(JSON.stringify({ type: 'stt_ready', language: lang }));
      }

      // 3. Stop STT session
      else if (msg.type === 'stop') {
        session.speechEndTimestamp = Date.now();
        if (session.sttSession) {
          session.sttSession.stop();
          session.sttSession = null;
        }
      }

      // 4. Barge-In (cancel TTS audio immediately within 200ms)
      else if (msg.type === 'barge_in') {
        if (session.ttsStreamer) {
          session.ttsStreamer.cancel();
          session.ttsStreamer = null;
        }
        ws.send(JSON.stringify({ type: 'barge_in_ok', timestamp: Date.now() }));
      }

      // 5. Speak (TTS request)
      else if (msg.type === 'speak') {
        const text = msg.text;
        const lang = msg.language || session.currentLanguage || 'en';
        if (!text) return;

        // Cancel previous TTS if running
        if (session.ttsStreamer) {
          session.ttsStreamer.cancel();
        }

        session.ttsStreamer = new GnaniTtsStreamer();
        let firstChunkSent = false;

        ws.send(JSON.stringify({ type: 'agent_audio_start' }));

        session.ttsStreamer.stream({
          text,
          language: lang,
          onAudioChunk: (chunk) => {
            if (ws.readyState === WebSocket.OPEN) {
              if (!firstChunkSent) {
                firstChunkSent = true;
                if (session.speechEndTimestamp) {
                  const latencyMs = Date.now() - session.speechEndTimestamp;
                  ws.send(JSON.stringify({ type: 'latency', ms: latencyMs }));
                  session.speechEndTimestamp = null;
                }
              }
              // Send binary PCM chunk to client
              ws.send(chunk, { binary: true });
            }
          },
          onDone: () => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'agent_audio_end' }));
            }
          },
          onError: (err) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'error', message: `TTS error: ${err.message}` }));
            }
          },
        });
      }
    } catch (err: any) {
      console.warn('Relay message parsing error:', err.message);
    }
  });

  ws.on('close', () => {
    if (session.sttSession) {
      session.sttSession.stop();
    }
    if (session.ttsStreamer) {
      session.ttsStreamer.cancel();
    }
  });
});

export function startServer(port: number = config.PORT): Promise<http.Server> {
  return new Promise((resolve) => {
    if (server.listening) {
      resolve(server);
      return;
    }
    server.listen(port, () => {
      console.log(`🚀 ASHA Relay Server running on port ${port}`);
      console.log(`🩺 Health check available at http://localhost:${port}/health`);
      console.log(`🔌 Voice WebSocket available at ws://localhost:${port}/ws`);
      resolve(server);
    });
  });
}

// Start automatically if run directly
const isDirectRun = process.argv[1] && (process.argv[1].endsWith('index.ts') || process.argv[1].endsWith('index.js'));
if (isDirectRun) {
  startServer(config.PORT);
}

export { app, server };
