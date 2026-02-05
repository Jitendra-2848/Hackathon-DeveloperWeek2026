

export const databaseConfig = {
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb:
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },

  
  sqlite: {
    filename: process.env.SQLITE_FILENAME || './data/voicedesk.db',
  },

  
  jsonFile: {
    historyPath: './data/history.json',
    settingsPath: './data/settings.json',
  },
};

export default databaseConfig;