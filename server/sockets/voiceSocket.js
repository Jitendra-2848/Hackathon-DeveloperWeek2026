

import { createClient } from '@deepgram/sdk';
import { SOCKET_EVENTS, VOICE_STATES } from '../utils/constants.js';
import { functionRegistry } from '../functions/functionRegistry.js';
import { logger } from '../utils/logger.js';

const voiceSessions = new Map();

export const setupVoiceSocket = (io, socket) => {
  socket.on(SOCKET_EVENTS.VOICE_START, async (data) => {
    try {
      logger.info('Starting voice session', { socketId: socket.id });

      const isDemoMode = !process.env.DEEPGRAM_API_KEY;

      if (isDemoMode) {
        logger.warn('Deepgram API key not configured, using demo mode');
        socket.emit(SOCKET_EVENTS.VOICE_READY, {
          sessionId: socket.id,
          mode: 'demo',
          message: 'Voice session started (demo mode)',
        });
        voiceSessions.set(socket.id, {
          mode: 'demo',
          startTime: Date.now(),
          audioChunks: [],
        });
        return;
      }

      const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

      const connection = deepgram.listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        punctuate: true,
        interim_results: true,
        utterance_end_ms: 1500,
        vad_events: true,
        encoding: 'linear16',
        sample_rate: 16000,
        channels: 1,
      });

      const session = {
        connection,
        deepgram,
        transcript: '',
        isListening: true,
        mode: 'live',
      };
      voiceSessions.set(socket.id, session);

      connection.on('open', () => {
        logger.info('Deepgram connection opened', { socketId: socket.id });
        socket.emit(SOCKET_EVENTS.VOICE_READY, {
          sessionId: socket.id,
          mode: 'live',
          message: 'Voice session started',
        });
        socket.emit(SOCKET_EVENTS.VOICE_STATUS, { status: VOICE_STATES.LISTENING });
      });

      connection.on('Results', (data) => {
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        const isFinal = data.is_final;

        if (transcript) {
          logger.debug('Transcript received', { transcript, isFinal });

          socket.emit(SOCKET_EVENTS.VOICE_TRANSCRIPT, {
            text: transcript,
            isFinal,
          });

          if (isFinal) {
            session.transcript = transcript;
          }
        }
      });

      connection.on('UtteranceEnd', async () => {
        logger.debug('Utterance ended', { socketId: socket.id });

        if (session.transcript) {
          await processTranscript(socket, session.transcript);
          session.transcript = '';
        }
      });

      connection.on('error', (error) => {
        logger.error('Deepgram error', { error: error.message, socketId: socket.id });
        socket.emit(SOCKET_EVENTS.VOICE_ERROR, {
          message: 'Voice processing error',
          error: error.message,
        });
      });

      connection.on('close', () => {
        logger.info('Deepgram connection closed', { socketId: socket.id });
      });

    } catch (error) {
      logger.error('Failed to start voice session', { error: error.message });
      socket.emit(SOCKET_EVENTS.VOICE_ERROR, {
        message: 'Failed to start voice session',
        error: error.message,
      });
    }
  });

  socket.on(SOCKET_EVENTS.VOICE_AUDIO, (data) => {
    const session = voiceSessions.get(socket.id);

    if (!session) {
      logger.warn('No active voice session', { socketId: socket.id });
      return;
    }

    if (session.mode === 'demo') {
      session.audioChunks.push(data.audio);
      const duration = Date.now() - session.startTime;
      if (duration > 2000 && !session.processed) {
        session.processed = true;
        const demoCommands = [
          'add a task to buy groceries',
          'schedule a meeting tomorrow at 2pm',
          'take a note about the project deadline',
          'send a message to the team about the update',
        ];
        const randomCommand = demoCommands[Math.floor(Math.random() * demoCommands.length)];
        setTimeout(() => {
          processTranscript(socket, randomCommand);
        }, 500);
      }
      return;
    }

    try {
      const audioBuffer = Buffer.from(data.audio);

      if (session.connection && session.isListening) {
        session.connection.send(audioBuffer);
      }
    } catch (error) {
      logger.error('Error processing audio', { error: error.message });
    }
  });

  socket.on(SOCKET_EVENTS.VOICE_STOP, () => {
    try {
      logger.info('Stopping voice session', { socketId: socket.id });

      const session = voiceSessions.get(socket.id);

      if (session) {
        session.isListening = false;

        if (session.connection) {
          session.connection.finish();
        }

        voiceSessions.delete(socket.id);
      }

      socket.emit(SOCKET_EVENTS.VOICE_STATUS, { status: VOICE_STATES.IDLE });
    } catch (error) {
      logger.error('Error stopping voice session', { error: error.message });
    }
  });

  socket.on(SOCKET_EVENTS.VOICE_TEXT, async (data) => {
    try {
      logger.info('Processing text command', { text: data.text, socketId: socket.id });
      await processTranscript(socket, data.text);
    } catch (error) {
      logger.error('Error processing text command', { error: error.message });
      socket.emit(SOCKET_EVENTS.VOICE_ERROR, {
        message: 'Error processing text command',
        error: error.message,
      });
    }
  });

  socket.on('disconnect', () => {
    const session = voiceSessions.get(socket.id);

    if (session) {
      if (session.connection) {
        session.connection.finish();
      }
      voiceSessions.delete(socket.id);
    }
  });
};


async function processTranscript(socket, transcript) {
  try {
    socket.emit(SOCKET_EVENTS.VOICE_STATUS, { status: VOICE_STATES.PROCESSING });

    
    const intent = analyzeIntent(transcript);

    if (intent.function) {
      
      socket.emit(SOCKET_EVENTS.VOICE_FUNCTION_CALL, {
        function: intent.function,
        name: intent.name,
        arguments: intent.arguments,
      });

      
      const result = await functionRegistry.execute(intent.function, intent.arguments);

      
      socket.emit(SOCKET_EVENTS.VOICE_FUNCTION_RESULT, {
        function: intent.function,
        success: result.success,
        result: result.data,
        error: result.error,
      });

      
      const response = generateResponse(intent, result);

      
      socket.emit(SOCKET_EVENTS.VOICE_RESPONSE, {
        text: response,
        function: intent.function,
        success: result.success,
      });
    } else {
      
      socket.emit(SOCKET_EVENTS.VOICE_RESPONSE, {
        text: "I heard you! How can I help you today? You can ask me to create tasks, schedule events, take notes, or send messages.",
      });
    }

    socket.emit(SOCKET_EVENTS.VOICE_STATUS, { status: VOICE_STATES.SPEAKING });

    
    setTimeout(() => {
      socket.emit(SOCKET_EVENTS.VOICE_STATUS, { status: VOICE_STATES.IDLE });
    }, 2000);

  } catch (error) {
    logger.error('Error processing transcript', { error: error.message });
    socket.emit(SOCKET_EVENTS.VOICE_ERROR, {
      message: 'Error processing your request',
      error: error.message,
    });
    socket.emit(SOCKET_EVENTS.VOICE_STATUS, { status: VOICE_STATES.ERROR });
  }
}


function analyzeIntent(transcript) {
  const text = transcript.toLowerCase();

  
  if (text.includes('add a task') || text.includes('create a task') || text.includes('add task') || text.includes('remind me to') || text.includes('todo')) {
    const taskMatch = text.match(/(?:add a task|create a task|add task|remind me to|todo)\s*(?:to\s*)?(.+)/i);
    return {
      function: 'create_trello_card',
      name: 'Create Task',
      arguments: {
        title: taskMatch ? taskMatch[1].trim() : transcript,
        description: '',
        priority: text.includes('high priority') || text.includes('urgent') ? 'high' : 'medium',
      },
    };
  }

  
  if (text.includes('schedule') || text.includes('meeting') || text.includes('appointment') || text.includes('calendar')) {
    const timeMatch = text.match(/(?:at|for)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    const dateMatch = text.match(/(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);

    return {
      function: 'create_calendar_event',
      name: 'Schedule Event',
      arguments: {
        title: extractEventTitle(text),
        start_time: timeMatch ? timeMatch[1] : '9:00 AM',
        date: dateMatch ? dateMatch[1] : 'today',
        description: '',
      },
    };
  }

  
  if (text.includes('note') || text.includes('write down') || text.includes('remember')) {
    const noteMatch = text.match(/(?:note|write down|remember)\s*(?:that\s*)?(.+)/i);
    return {
      function: 'create_notion_note',
      name: 'Create Note',
      arguments: {
        title: noteMatch ? noteMatch[1].slice(0, 50) : 'Quick Note',
        content: noteMatch ? noteMatch[1] : transcript,
      },
    };
  }

  
  if (text.includes('send a message') || text.includes('tell my team') || text.includes('message') || text.includes('slack')) {
    const messageMatch = text.match(/(?:send a message|tell my team|message|slack)\s*(?:that\s*)?(.+)/i);
    return {
      function: 'send_slack_message',
      name: 'Send Message',
      arguments: {
        message: messageMatch ? messageMatch[1] : transcript,
        channel: 'general',
      },
    };
  }

  
  if (text.includes("what's on my calendar") || text.includes('my schedule') || text.includes('events today')) {
    return {
      function: 'get_todays_events',
      name: 'Get Events',
      arguments: {},
    };
  }

  
  if (text.includes('pending tasks') || text.includes('my tasks') || text.includes('todo list')) {
    return {
      function: 'get_pending_tasks',
      name: 'Get Tasks',
      arguments: {},
    };
  }

  
  return { function: null };
}


function extractEventTitle(text) {
  
  let title = text
    .replace(/schedule|meeting|appointment|calendar|at\s+\d+.*/gi, '')
    .replace(/today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  
  if (title.length < 3) {
    if (text.includes('meeting')) return 'Meeting';
    if (text.includes('appointment')) return 'Appointment';
    return 'Event';
  }

  return title.charAt(0).toUpperCase() + title.slice(1);
}


function generateResponse(intent, result) {
  if (!result.success) {
    return `I'm sorry, I couldn't complete that action. ${result.error || 'Please try again.'}`;
  }

  switch (intent.function) {
    case 'create_trello_card':
      return `Done! I've created a task "${intent.arguments.title}" in your Trello board. Is there anything else you'd like me to do?`;

    case 'create_calendar_event':
      return `I've added "${intent.arguments.title}" to your calendar for ${intent.arguments.date} at ${intent.arguments.start_time}. Would you like to add any details?`;

    case 'create_notion_note':
      return `I've saved that note for you. The title is "${intent.arguments.title}". Anything else?`;

    case 'send_slack_message':
      return `Your message has been sent to the team. Is there anything else you need?`;

    case 'get_todays_events':
      if (result.data?.length > 0) {
        return `You have ${result.data.length} events today. ${result.data.map(e => e.title).join(', ')}. Would you like more details?`;
      }
      return "You don't have any events scheduled for today. Would you like to add one?";

    case 'get_pending_tasks':
      if (result.data?.length > 0) {
        return `You have ${result.data.length} pending tasks. The top ones are: ${result.data.slice(0, 3).map(t => t.title).join(', ')}.`;
      }
      return "You don't have any pending tasks. Great job staying on top of things!";

    default:
      return "I've completed that action for you. What else can I help with?";
  }
}

export default setupVoiceSocket;