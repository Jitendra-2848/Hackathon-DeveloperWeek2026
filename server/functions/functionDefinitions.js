

export const functionDefinitions = [
  {
    name: 'create_trello_card',
    description: 'Create a new task card in Trello board',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the task',
        },
        description: {
          type: 'string',
          description: 'Optional description of the task',
        },
        due_date: {
          type: 'string',
          description: 'Optional due date in ISO format or natural language',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Priority level of the task',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'create_calendar_event',
    description: 'Schedule a new event in Google Calendar',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the event',
        },
        start_time: {
          type: 'string',
          description: 'Start time in natural language or ISO format',
        },
        end_time: {
          type: 'string',
          description: 'End time (optional, defaults to 1 hour after start)',
        },
        date: {
          type: 'string',
          description: 'Date of the event (today, tomorrow, or specific date)',
        },
        description: {
          type: 'string',
          description: 'Event description',
        },
        location: {
          type: 'string',
          description: 'Event location',
        },
      },
      required: ['title', 'start_time'],
    },
  },
  {
    name: 'create_notion_note',
    description: 'Create a new note or page in Notion',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the note',
        },
        content: {
          type: 'string',
          description: 'Content of the note',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for categorizing the note',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'send_slack_message',
    description: 'Send a message to a Slack channel or user',
    parameters: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'The message content to send',
        },
        channel: {
          type: 'string',
          description: 'Channel name or ID (optional, uses default if not specified)',
        },
      },
      required: ['message'],
    },
  },
  {
    name: 'get_todays_events',
    description: 'Get all events scheduled for today from Google Calendar',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_pending_tasks',
    description: 'Get all pending tasks from Trello',
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of tasks to return',
        },
      },
      required: [],
    },
  },
];

export default functionDefinitions;