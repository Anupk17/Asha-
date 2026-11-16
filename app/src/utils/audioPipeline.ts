/**
 * Client-Side Streaming Voice Pipeline for ASHA Voice Register.
 * Handles:
 * 1. 16 kHz Mono PCM16 Audio Capture (Noise suppression, echo cancellation, auto gain ON)
 * 2. VAD / Silence Window Endpointing (700ms default, 1200ms in noisy surroundings mode)
 * 3. Streaming TTS Playback Queue (starts on first audio chunk)
 * 4. Fast Barge-In (< 200ms) interrupting playback and cancelling stream
 * 5. Latency Measurement (end-of-speech to first agent audio byte)
 */

export interface VoicePipelineCallbacks {
  onPartialTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onAgentAudioStart?: () => void;
  onAgentAudioEnd?: () => void;
  onLatencyMeasured?: (ms: number) => void;
  onError?: (err: string) => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
  onAudioLevels?: (levels: number[]) => void;
}

export class VoicePipeline {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;

  // Playback queue
  private playbackContext: AudioContext | null = null;
  private nextPlayTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];

  // VAD & State
  private isRecording: boolean = false;
  private silenceTimer: any = null;
  private silenceThresholdMs: number = 700;
  private isAgentSpeaking: boolean = false;
  private callbacks: VoicePipelineCallbacks = {};

  constructor(callbacks: VoicePipelineCallbacks) {
    this.callbacks = callbacks;
  }

  public setNoisySurroundings(isNoisy: boolean) {
    this.silenceThresholdMs = isNoisy ? 1200 : 700;
  }

  public async connect(relayUrl: string, token: string): Promise<boolean> {
    return new Promise((resolve) => {
      const wsUrl = relayUrl.replace(/^http/, 'ws') + '/ws';
      console.log(`Connecting to voice relay: ${wsUrl}`);

      try {
        this.ws = new WebSocket(wsUrl);
      } catch (err: any) {
        this.callbacks.onError?.(`Cannot connect to relay: ${err.message}`);
        resolve(false);
        return;
      }

      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        // Send auth immediately
        this.ws?.send(JSON.stringify({ type: 'auth', token }));
      };

      this.ws.onmessage = (event) => {
        // Binary TTS audio chunk from relay
        if (event.data instanceof ArrayBuffer) {
          this.handleIncomingAudioChunk(event.data);
          return;
        }

        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'auth_ok') {
            resolve(true);
          } else if (msg.type === 'partial') {
            this.callbacks.onPartialTranscript?.(msg.text);
          } else if (msg.type === 'final') {
            this.callbacks.onFinalTranscript?.(msg.text);
          } else if (msg.type === 'agent_audio_start') {
            this.isAgentSpeaking = true;
            this.callbacks.onAgentAudioStart?.();
          } else if (msg.type === 'agent_audio_end') {
            this.isAgentSpeaking = false;
            this.callbacks.onAgentAudioEnd?.();
          } else if (msg.type === 'latency') {
            this.callbacks.onLatencyMeasured?.(msg.ms);
          } else if (msg.type === 'error') {
            this.callbacks.onError?.(msg.message);
          }
        } catch {
          // Non-JSON string
        }
      };

      this.ws.onerror = () => {
        this.callbacks.onError?.('Relay WebSocket connection error');
        resolve(false);
      };

      this.ws.onclose = () => {
        console.log('Relay WebSocket closed');
      };
    });
  }

  public async startRecording(language: string): Promise<void> {
    if (this.isRecording) return;

    // Barge-in check: if agent was talking when user starts speaking
    if (this.isAgentSpeaking) {
      this.triggerBargeIn();
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      // 4096 buffer size at 16kHz is ~256ms chunk
      this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processorNode.onaudioprocess = (e) => {
        if (!this.isRecording) return;
        const inputData = e.inputBuffer.getChannelData(0);

        // Calculate audio RMS level for VAD and UI waveform
        let sumSquares = 0;
        for (let i = 0; i < inputData.length; i++) {
          sumSquares += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sumSquares / inputData.length);

        // Convert Float32 to 16-bit PCM Linear
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Send binary PCM frame to relay
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(pcm16.buffer);
        }

        // VAD Silence Detection
        const isSpeaking = rms > 0.015;
        this.callbacks.onSpeakingChange?.(isSpeaking);

        if (isSpeaking) {
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
          }
        } else {
          // If silent and no timer running, start silence countdown
          if (!this.silenceTimer) {
            this.silenceTimer = setTimeout(() => {
              console.log('VAD endpoint triggered: auto-stopping recording');
              this.stopRecording();
            }, this.silenceThresholdMs);
          }
        }
      };

      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      this.isRecording = true;
      // Inform relay to start STT session
      this.ws?.send(JSON.stringify({ type: 'start', language }));
    } catch (err: any) {
      this.callbacks.onError?.(`Microphone access error: ${err.message}`);
    }
  }

  public stopRecording(): void {
    if (!this.isRecording) return;
    this.isRecording = false;

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    this.ws?.send(JSON.stringify({ type: 'stop' }));
  }

  /**
   * Barge-In: instantly aborts agent audio playback within <200ms
   */
  public triggerBargeIn(): void {
    console.log('⚡ Barge-in triggered: cutting agent playback');
    this.stopPlayback();
    this.ws?.send(JSON.stringify({ type: 'barge_in' }));
    this.isAgentSpeaking = false;
    this.callbacks.onAgentAudioEnd?.();
  }

  public requestTts(text: string, language?: string): void {
    this.stopPlayback();
    this.ws?.send(JSON.stringify({ type: 'speak', text, language }));
  }

  private handleIncomingAudioChunk(arrayBuffer: ArrayBuffer): void {
    if (!this.playbackContext || this.playbackContext.state === 'closed') {
      this.playbackContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      this.nextPlayTime = this.playbackContext.currentTime;
    }

    const int16 = new Int16Array(arrayBuffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }

    const audioBuffer = this.playbackContext.createBuffer(1, float32.length, 16000);
    audioBuffer.getChannelData(0).set(float32);

    const source = this.playbackContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.playbackContext.destination);

    // Schedule seamlessly
    const startTime = Math.max(this.playbackContext.currentTime, this.nextPlayTime);
    source.start(startTime);
    this.nextPlayTime = startTime + audioBuffer.duration;
    this.activeSources.push(source);

    source.onended = () => {
      this.activeSources = this.activeSources.filter((s) => s !== source);
    };
  }

  public stopPlayback(): void {
    this.activeSources.forEach((s) => {
      try {
        s.stop();
        s.disconnect();
      } catch {
        // Already ended
      }
    });
    this.activeSources = [];
    if (this.playbackContext) {
      this.playbackContext.close();
      this.playbackContext = null;
    }
    this.nextPlayTime = 0;
  }

  public disconnect(): void {
    this.stopRecording();
    this.stopPlayback();
    this.ws?.close();
    this.ws = null;
  }
}

