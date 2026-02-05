

import { createClient } from '@deepgram/sdk';
import { deepgramConfig } from '../config/deepgram.config.js';
import { logger } from '../utils/logger.js';

class DeepgramService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
  }

  
  initialize() {
    if (this.isInitialized) return this.client;

    const apiKey = process.env.DEEPGRAM_API_KEY;

    if (!apiKey) {
      logger.warn('Deepgram API key not configured');
      return null;
    }

    try {
      this.client = createClient(apiKey);
      this.isInitialized = true;
      logger.info('Deepgram client initialized');
      return this.client;
    } catch (error) {
      logger.error('Failed to initialize Deepgram client', { error: error.message });
      return null;
    }
  }

  
  getClient() {
    if (!this.isInitialized) {
      this.initialize();
    }
    return this.client;
  }

  
  isConfigured() {
    return !!process.env.DEEPGRAM_API_KEY;
  }

  
  async getStatus() {
    if (!this.isConfigured()) {
      return {
        configured: false,
        connected: false,
        message: 'Deepgram API key not configured',
      };
    }

    try {
      const client = this.getClient();
      
      return {
        configured: true,
        connected: !!client,
        message: 'Deepgram is configured and ready',
      };
    } catch (error) {
      return {
        configured: true,
        connected: false,
        message: error.message,
      };
    }
  }

  
  createLiveConnection(options = {}) {
    const client = this.getClient();

    if (!client) {
      throw new Error('Deepgram client not initialized');
    }

    const config = {
      model: deepgramConfig.agent.listen.model,
      language: deepgramConfig.agent.listen.language,
      smart_format: deepgramConfig.agent.listen.smart_format,
      punctuate: deepgramConfig.agent.listen.punctuate,
      interim_results: deepgramConfig.agent.listen.interim_results,
      utterance_end_ms: deepgramConfig.agent.listen.utterance_end_ms,
      vad_events: deepgramConfig.agent.listen.vad_events,
      encoding: 'linear16',
      sample_rate: 16000,
      channels: 1,
      ...options,
    };

    logger.debug('Creating live transcription connection', { config });

    return client.listen.live(config);
  }

  
  async transcribeFile(audioBuffer, options = {}) {
    const client = this.getClient();

    if (!client) {
      throw new Error('Deepgram client not initialized');
    }

    const config = {
      model: deepgramConfig.agent.listen.model,
      language: deepgramConfig.agent.listen.language,
      smart_format: true,
      punctuate: true,
      ...options,
    };

    logger.debug('Transcribing audio file', { size: audioBuffer.length });

    try {
      const { result } = await client.listen.prerecorded.transcribeFile(
        audioBuffer,
        config
      );

      return {
        transcript: result.results.channels[0].alternatives[0].transcript,
        confidence: result.results.channels[0].alternatives[0].confidence,
        words: result.results.channels[0].alternatives[0].words,
      };
    } catch (error) {
      logger.error('Transcription failed', { error: error.message });
      throw error;
    }
  }

  
  async transcribeUrl(url, options = {}) {
    const client = this.getClient();

    if (!client) {
      throw new Error('Deepgram client not initialized');
    }

    const config = {
      model: deepgramConfig.agent.listen.model,
      language: deepgramConfig.agent.listen.language,
      smart_format: true,
      punctuate: true,
      ...options,
    };

    logger.debug('Transcribing audio from URL', { url });

    try {
      const { result } = await client.listen.prerecorded.transcribeUrl(
        { url },
        config
      );

      return {
        transcript: result.results.channels[0].alternatives[0].transcript,
        confidence: result.results.channels[0].alternatives[0].confidence,
      };
    } catch (error) {
      logger.error('Transcription failed', { error: error.message });
      throw error;
    }
  }

  
  async textToSpeech(text, options = {}) {
    const client = this.getClient();

    if (!client) {
      throw new Error('Deepgram client not initialized');
    }

    const config = {
      model: options.voice || deepgramConfig.agent.speak.model,
    };

    logger.debug('Generating speech', { textLength: text.length, model: config.model });

    try {
      const response = await client.speak.request(
        { text },
        config
      );

      
      const stream = await response.getStream();
      
      if (stream) {
        
        const chunks = [];
        const reader = stream.getReader();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }

        const audioBuffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
        
        return {
          audio: audioBuffer,
          contentType: 'audio/mp3',
        };
      }

      throw new Error('Failed to get audio stream');
    } catch (error) {
      logger.error('Text-to-speech failed', { error: error.message });
      throw error;
    }
  }
}


export const deepgramService = new DeepgramService();
export default deepgramService;