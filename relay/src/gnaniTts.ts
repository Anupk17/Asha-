import WebSocket from 'ws';
import { config } from './config.js';
import { mapToGnaniLanguageCode } from './gnaniStt.js';

export interface TtsStreamOptions {
  text: string;
  language: string;
  onAudioChunk: (chunk: Buffer) => void;
  onDone: () => void;
  onError?: (err: Error) => void;
}

export class GnaniTtsStreamer {
  private ws: WebSocket | null = null;
  private isCancelled: boolean = false;

  public stream(options: TtsStreamOptions): void {
    const isMockKey =
      !config.GNANI_API_KEY ||
      config.GNANI_API_KEY === 'dev_placeholder_gnani_key' ||
      config.GNANI_API_KEY.startsWith('placeholder');

    if (isMockKey) {
      console.log('ℹ️ Generating simulated audio stream for local dev testing.');
      this.simulateAudio(options);
      return;
    }

    const gnaniLang = mapToGnaniLanguageCode(options.language);
    const gnaniUrl = 'wss://api.vachana.ai/api/v1/tts';

    try {
      this.ws = new WebSocket(gnaniUrl, {
        headers: {
          'X-API-Key-ID': config.GNANI_API_KEY,
        },
      });

      this.ws.on('open', () => {
        if (this.isCancelled) {
          this.ws?.close();
          return;
        }

        const payload = {
          text: options.text,
          model: 'timbre-v3',
          language: gnaniLang,
          speed: 1.0,
          audio_config: {
            encoding: 'pcm16',
            sample_rate: 16000,
          },
        };

        this.ws?.send(JSON.stringify(payload));
      });

      this.ws.on('message', (data: WebSocket.RawData) => {
        if (this.isCancelled) return;

        if (Buffer.isBuffer(data)) {
          options.onAudioChunk(data);
        } else {
          try {
            const parsed = JSON.parse(data.toString());
            if (parsed.audio_content) {
              const audioBuf = Buffer.from(parsed.audio_content, 'base64');
              options.onAudioChunk(audioBuf);
            }
            if (parsed.is_final) {
              options.onDone();
            }
          } catch {
            // Non-JSON frame
          }
        }
      });

      this.ws.on('error', (err) => {
        if (!this.isCancelled) {
          console.warn('Gnani TTS WebSocket error:', err.message);
          this.simulateAudio(options);
        }
      });

      this.ws.on('close', () => {
        if (!this.isCancelled) {
          options.onDone();
        }
      });
    } catch (err: any) {
      console.warn('Gnani TTS connection failed:', err.message);
      this.simulateAudio(options);
    }
  }

  public cancel(): void {
    this.isCancelled = true;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.close();
      } catch {
        // Ignore
      }
    }
    this.ws = null;
  }

  /**
   * Generates a 16kHz PCM audio chunk for development testing without live API keys
   */
  private simulateAudio(options: TtsStreamOptions): void {
    if (this.isCancelled) return;

    // 400ms of a soft 440Hz beep at 16kHz mono 16-bit PCM
    const sampleRate = 16000;
    const durationSec = 0.4;
    const numSamples = Math.floor(sampleRate * durationSec);
    const buffer = Buffer.alloc(numSamples * 2);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * 440 * t) * 8000; // gentle volume
      buffer.writeInt16LE(Math.floor(sample), i * 2);
    }

    setTimeout(() => {
      if (!this.isCancelled) {
        options.onAudioChunk(buffer);
        setTimeout(() => {
          if (!this.isCancelled) {
            options.onDone();
          }
        }, 100);
      }
    }, 80);
  }
}

