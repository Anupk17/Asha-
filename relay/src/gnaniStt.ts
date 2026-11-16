import WebSocket from 'ws';
import { config } from './config.js';
import { applyVocabularyPostCorrection } from '@asha/shared';

export interface SttSessionOptions {
  language: string;
  onPartial: (text: string) => void;
  onFinal: (text: string) => void;
  onError?: (err: Error) => void;
  onClose?: () => void;
}

export function mapToGnaniLanguageCode(lang: string): string {
  switch (lang) {
    case 'hi':
      return 'hi-en'; // Best for Hindi + English code-mixing
    case 'ta':
      return 'ta-IN';
    case 'te':
      return 'te-IN';
    case 'kn':
      return 'kn-IN';
    case 'ml':
      return 'ml-IN';
    case 'mr':
      return 'mr-IN';
    case 'en':
    default:
      return 'en-IN';
  }
}

export class GnaniSttSession {
  private ws: WebSocket | null = null;
  private options: SttSessionOptions;
  private isConnected: boolean = false;
  private isDevSimulated: boolean = false;
  private audioBufferCount: number = 0;

  constructor(options: SttSessionOptions) {
    this.options = options;
  }

  public connect(): void {
    const isMockKey =
      !config.GNANI_API_KEY ||
      config.GNANI_API_KEY === 'dev_placeholder_gnani_key' ||
      config.GNANI_API_KEY.startsWith('placeholder');

    if (isMockKey) {
      console.log('ℹ️ Using simulated Gnani STT pipeline for local development.');
      this.isDevSimulated = true;
      this.isConnected = true;
      return;
    }

    const gnaniLang = mapToGnaniLanguageCode(this.options.language);
    const gnaniUrl = `wss://api.vachana.ai/stt/v3/stream?language_code=${gnaniLang}&encoding=pcm16&sample_rate=16000&channels=1`;

    try {
      this.ws = new WebSocket(gnaniUrl, {
        headers: {
          'X-API-Key-ID': config.GNANI_API_KEY,
        },
      });

      this.ws.on('open', () => {
        this.isConnected = true;
        console.log(`📡 Connected to Gnani Prisma STT (language: ${gnaniLang})`);
      });

      this.ws.on('message', (data: WebSocket.RawData) => {
        try {
          const payload = JSON.parse(data.toString());
          // Gnani response format parsing: { text: "...", is_final: boolean }
          const transcript = payload.text || payload.transcript || '';
          const isFinal = Boolean(payload.is_final || payload.final);

          if (isFinal) {
            const canonical = applyVocabularyPostCorrection(transcript);
            this.options.onFinal(canonical);
          } else if (transcript) {
            this.options.onPartial(transcript);
          }
        } catch (e) {
          // If plain text received
          const text = data.toString();
          if (text) this.options.onPartial(text);
        }
      });

      this.ws.on('error', (err) => {
        console.warn('Gnani STT WebSocket error:', err.message);
        this.options.onError?.(err);
      });

      this.ws.on('close', () => {
        this.isConnected = false;
        this.options.onClose?.();
      });
    } catch (err: any) {
      console.warn('Failed to connect to Gnani STT:', err.message);
      this.isDevSimulated = true;
      this.isConnected = true;
    }
  }

  public sendAudioChunk(pcmChunk: Buffer): void {
    if (this.isDevSimulated) {
      this.audioBufferCount++;
      // Provide simulated live partials for testing in dev without live API keys
      if (this.audioBufferCount === 5) {
        this.options.onPartial('Meena Devi Rampur');
      } else if (this.audioBufferCount === 12) {
        this.options.onPartial('Meena Devi Rampur 54.5 kg weight TT booster');
      }
      return;
    }

    if (this.ws && this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(pcmChunk);
    }
  }

  public stop(): void {
    if (this.isDevSimulated && this.audioBufferCount > 0) {
      const sampleText =
        this.options.language === 'en'
          ? 'Conducted ANC visit for Meena Devi Rampur. Weight is 54.5 kg, normal temperature. TT booster due next Monday.'
          : 'मीना देवी रामपुर का ANC विज़िट किया। वजन 54.5 किलो है, TT booster टीका बाकी है अगली भेंट सोमवार को।';
      const canonical = applyVocabularyPostCorrection(sampleText);
      this.options.onFinal(canonical);
      this.audioBufferCount = 0;
      return;
    }

    if (this.ws && this.isConnected) {
      try {
        // Send end marker if specified by Gnani or close connection gracefully
        this.ws.send(JSON.stringify({ type: 'end' }));
        this.ws.close();
      } catch {
        // Ignore
      }
    }
    this.isConnected = false;
  }
}

