// Audio utilities for Web Speech API and Base64 audio playback

export function playBase64Wav(base64Data: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Ensure valid data URL prefix if missing
      const audioUrl = base64Data.startsWith('data:') 
        ? base64Data 
        : `data:audio/webm;base64,${base64Data}`;
      const audio = new Audio(audioUrl);
      audio.onended = () => resolve();
      audio.onerror = (e) => reject(e);
      audio.play().catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}

export function speakTextWithWebSpeech(text: string, langCode: string = 'pt-PT'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Navegador não suporta síntese de voz'));
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose appropriate voice
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith('pt')) || voices[0];
    if (ptVoice) {
      utterance.voice = ptVoice;
    }
    
    utterance.rate = 0.9; // slightly slower for better phonetic clarity
    utterance.pitch = 1.0;
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    window.speechSynthesis.speak(utterance);
  });
}

// Media Recorder helper for user community pronunciation audio
// Optimized for speech compression (mono, 24kbps, lightweight payloads)
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private autoStopTimer: any = null;
  private stream: MediaStream | null = null;
  private chosenMimeType: string = 'audio/webm';

  async start(onMaxDurationReached?: () => void): Promise<void> {
    this.audioChunks = [];
    
    // Request mono audio with noise suppression and speech-friendly sample rate
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
      } 
    });
    this.stream = stream;

    // Detect best lightweight audio container supported by browser
    let mimeType = '';
    const candidateTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/aac'
    ];

    for (const type of candidateTypes) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        mimeType = type;
        break;
      }
    }
    this.chosenMimeType = mimeType || 'audio/webm';

    const recorderOptions: MediaRecorderOptions = {
      audioBitsPerSecond: 24000, // 24 kbps is ultra-light (~3KB per second) and clear
    };
    if (mimeType) {
      recorderOptions.mimeType = mimeType;
    }

    try {
      this.mediaRecorder = new MediaRecorder(stream, recorderOptions);
    } catch (e) {
      // Fallback without options if browser rejects specified settings
      this.mediaRecorder = new MediaRecorder(stream);
    }

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    // Auto-stop after 8 seconds (word pronunciations never require longer)
    this.autoStopTimer = setTimeout(() => {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        if (onMaxDurationReached) {
          onMaxDurationReached();
        }
      }
    }, 8000);

    this.mediaRecorder.start(250); // Slice in small chunks
  }

  stop(): Promise<{ blob: Blob; base64: string }> {
    return new Promise((resolve, reject) => {
      if (this.autoStopTimer) {
        clearTimeout(this.autoStopTimer);
        this.autoStopTimer = null;
      }

      if (!this.mediaRecorder) {
        return reject(new Error('Gravador não inicializado'));
      }

      this.mediaRecorder.onstop = () => {
        try {
          const mime = this.chosenMimeType || 'audio/webm';
          const audioBlob = new Blob(this.audioChunks, { type: mime });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64data = (reader.result as string) || '';
            // Stop all audio tracks to turn off microphone indicator
            if (this.stream) {
              this.stream.getTracks().forEach(t => t.stop());
              this.stream = null;
            }
            resolve({ blob: audioBlob, base64: base64data });
          };
          reader.onerror = (err) => reject(err);
        } catch (err) {
          reject(err);
        }
      };

      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      } else {
        // Already stopped
        const audioBlob = new Blob(this.audioChunks, { type: this.chosenMimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          resolve({ blob: audioBlob, base64: (reader.result as string) || '' });
        };
      }
    });
  }

  cancel(): void {
    if (this.autoStopTimer) {
      clearTimeout(this.autoStopTimer);
      this.autoStopTimer = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    this.audioChunks = [];
  }
}

