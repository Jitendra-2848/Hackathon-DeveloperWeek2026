class AudioService {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
  }

  // Initialize audio context
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Create analyser for visualization
  createAnalyser(stream) {
    this.init();
    
    const source = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
    
    source.connect(this.analyser);
    
    return this.analyser;
  }

  // Get audio levels for visualization
  getAudioLevels() {
    if (!this.analyser || !this.dataArray) return [];
    
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Return normalized values (0-1)
    return Array.from(this.dataArray)
      .slice(0, 9) // Take first 9 frequency bins
      .map((value) => value / 255);
  }

  // Play audio from buffer
  async playAudio(audioData) {
    this.init();
    
    try {
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start(0);
      
      return new Promise((resolve) => {
        source.onended = resolve;
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  }

  // Play audio from URL
  async playAudioUrl(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return this.playAudio(arrayBuffer);
  }

  // Stop all audio
  stop() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.dataArray = null;
  }

  // Resume audio context (needed after user interaction)
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      return this.audioContext.resume();
    }
    return Promise.resolve();
  }
}

export const audioService = new AudioService();
export default audioService;