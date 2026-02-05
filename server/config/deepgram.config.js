

export const deepgramConfig = {
  
  apiKey: process.env.DEEPGRAM_API_KEY,

  
  agent: {
    
    listen: {
      model: 'nova-2',
      language: 'en-US',
      smart_format: true,
      punctuate: true,
      profanity_filter: false,
      diarize: false,
      filler_words: false,
      interim_results: true,
      utterance_end_ms: 1000,
      vad_events: true,
    },

    
    speak: {
      model: 'aura-asteria-en', 
      
      
      
      
      
      
      
    },

    
    think: {
      provider: {
        type: 'open_ai',
      },
      model: 'gpt-4o-mini',
      instructions: `You are VoiceDesk, a helpful and friendly voice assistant that helps users manage their productivity. You can:

1. Create tasks in Trello - When users want to add tasks, todos, or reminders
2. Schedule events in Google Calendar - When users want to schedule meetings, appointments, or events
3. Create notes in Notion - When users want to save notes, ideas, or documentation
4. Send messages via Slack - When users want to communicate with their team

Guidelines:
- Be conversational, helpful, and concise
- Confirm actions after completing them
- Ask for clarification if the request is unclear
- Keep responses brief for voice interaction (2-3 sentences max)
- Use natural language, not technical jargon
- Be proactive in offering help

When a user asks you to do something:
1. Understand their intent
2. Use the appropriate function to complete the action
3. Confirm what you did in a natural way

Examples:
- "Add a task to buy groceries" → Create Trello card
- "Schedule a meeting tomorrow at 3pm" → Create calendar event
- "Take a note about the project idea" → Create Notion page
- "Tell my team I'll be late" → Send Slack message`,
    },
  },

  
  audio: {
    encoding: 'linear16',
    sampleRate: 16000,
    channels: 1,
  },
};


export const voiceOptions = [
  { id: 'aura-asteria-en', name: 'Asteria', gender: 'Female', description: 'Warm and friendly' },
  { id: 'aura-luna-en', name: 'Luna', gender: 'Female', description: 'Calm and soothing' },
  { id: 'aura-stella-en', name: 'Stella', gender: 'Female', description: 'Professional' },
  { id: 'aura-athena-en', name: 'Athena', gender: 'Female', description: 'Confident' },
  { id: 'aura-hera-en', name: 'Hera', gender: 'Female', description: 'Authoritative' },
  { id: 'aura-orion-en', name: 'Orion', gender: 'Male', description: 'Deep and clear' },
  { id: 'aura-perseus-en', name: 'Perseus', gender: 'Male', description: 'Energetic' },
];

export default deepgramConfig;