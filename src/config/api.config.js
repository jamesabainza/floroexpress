export const API_CONFIG = {
    OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY || 'your-api-key',
    API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
    OPENAI: {
        API_URL: 'https://api.openai.com/v1',
        MODEL: 'gpt-4-1106-preview',
        MAX_TOKENS: 2000,
        TEMPERATURE: 0.7,
        ANALYSIS_SETTINGS: {
            CHUNK_SIZE: 4000,  // Size of text chunks to process
            MAX_CHUNKS: 5,     // Maximum number of chunks to process
            OVERLAP: 200       // Overlap between chunks to maintain context
        }
    }
};
