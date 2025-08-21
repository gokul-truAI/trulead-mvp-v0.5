import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Simple time-based key rotation to distribute load.
// This is a basic strategy; more sophisticated patterns could be used in production.
const getApiKey = () => {
    const keys = process.env.GEMINI_API_KEYS?.split(',').filter(k => k.trim());

    if (!keys || keys.length === 0) {
        // Fallback to the single key environment variable if the list is not defined.
        return process.env.GEMINI_API_KEY;
    }

    // Rotate key every minute
    const now = new Date();
    const index = now.getMinutes() % keys.length;
    return keys[index];
}

export const ai = genkit({
  plugins: [googleAI({ apiKey: getApiKey() })],
  model: 'googleai/gemini-2.0-flash',
});
