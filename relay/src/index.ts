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
    currentLanguage: 'hi',
    speechEndTimestamp: null,
  };

  // If token is provided in query param on handshake, authenticate immediately
  if (queryToken) {
    verifyIdToken(queryToken).then((user) => {
      if (user) {
        session.isAuthenticated = true;
        session.userId = user.uid;
        ws.send(JSON.stringify({ type: 'auth_ok', uid: user.uid }));
      } else {
        ws.close(4001, 'Unauthorized');
      }
    });
  }

  ws.on('message', async (data: Buffer | string, isBinary: boolean) => {
    // 1. Binary message = raw PCM 16kHz audio from client
    if (isBinary) {
      if (!session.isAuthenticated) {
        ws.close(4001, 'Unauthorized');
        return;
      }
      if (session.sttSession && Buffer.isBuffer(data)) {
        session.sttSession.sendAudioChunk(data);
      }
      return;
    }

    // 2. Text message = control frames
    try {
      const msg = JSON.parse(data.toString());

      // Auth frame
      if (msg.type === 'auth') {
        const user = await verifyIdToken(msg.token);
        if (user) {
          session.isAuthenticated = true;
          session.userId = user.uid;
          ws.send(JSON.stringify({ type: 'auth_ok', uid: user.uid }));
        } else {
          ws.close(4001, 'Unauthorized');
        }
        return;
      }

      // Enforce auth on all other operations
      if (!session.isAuthenticated || !session.userId) {
        ws.close(4001, 'Unauthorized');
        return;
      }

      // Check per-user rate limit (120 req/min)
      if (!userRateLimiter.check(session.userId)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Rate limit exceeded' }));
        return;
      }

      // Start STT stream
      if (msg.type === 'start') {
        const lang = msg.language || session.currentLanguage || 'hi';
        session.currentLanguage = lang;

        if (session.sttSession) {
          session.sttSession.stop();
        }

        session.sttSession = new GnaniSttSession({
          language: lang,
          onPartialTranscript: (transcript) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'partial', transcript }));
            }
          },
          onFinalTranscript: (transcript) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'final', transcript }));
            }
          },
          onError: (err) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'error', message: `STT error: ${err.message}` }));
            }
          },
        });

        session.sttSession.start();
        ws.send(JSON.stringify({ type: 'stt_ready', language: lang }));
      }

      // Stop STT stream (end of speech / silence endpoint hit)
      if (msg.type === 'stop') {
        session.speechEndTimestamp = Date.now();
        if (session.sttSession) {
          session.sttSession.stop();
          session.sttSession = null;
        }
        ws.send(JSON.stringify({ type: 'stt_stopped' }));
      }

      // Barge-in: user spoke while agent was talking -> immediately cancel TTS
      if (msg.type === 'barge_in') {
        if (session.ttsStreamer) {
          session.ttsStreamer.cancel();
          session.ttsStreamer = null;
        }
        ws.send(JSON.stringify({ type: 'barge_in_ok' }));
      }

      // Speak: synthesize agent speech with Gnani Timbre and stream PCM audio back
      if (msg.type === 'speak') {
        const text = msg.text;
        const lang = msg.language || session.currentLanguage || 'hi';

        if (session.ttsStreamer) {
          session.ttsStreamer.cancel();
        }

        session.ttsStreamer = new GnaniTtsStreamer();
        ws.send(JSON.stringify({ type: 'agent_audio_start' }));

        let firstChunkSent = false;

        session.ttsStreamer.streamSpeech({
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
