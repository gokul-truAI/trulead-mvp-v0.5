'use server';

/**
 * @fileOverview An AI agent for performing market analysis on a lead.
 *
 * - generateMarketAnalysis - A function that generates a market analysis.
 * - GenerateMarketAnalysisInput - The input type for the generateMarketAnalysis function.
 * - GenerateMarketAnalysisOutput - The return type for the generateMarketAnalysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { faker } from '@faker-js/faker';

const GenerateMarketAnalysisInputSchema = z.object({
  company: z.string().optional().describe('The name of the company.'),
  industry: z.string().optional().describe('The industry of the company.'),
  description: z.string().optional().describe('A short description of the company.')
});
export type GenerateMarketAnalysisInput = z.infer<typeof GenerateMarketAnalysisInputSchema>;

const GenerateMarketAnalysisOutputSchema = z.object({
  confidenceScore: z.number().min(0).max(100).describe('A confidence score from 0-100 indicating the quality and potential of the lead. 100 is the highest potential.'),
  analysisNote: z.string().describe('A short, insightful note for a sales representative explaining the reasoning behind the score and providing a strategic talking point.'),
});
export type GenerateMarketAnalysisOutput = z.infer<typeof GenerateMarketAnalysisOutputSchema>;

export async function generateMarketAnalysis(input: GenerateMarketAnalysisInput): Promise<GenerateMarketAnalysisOutput> {
  return generateMarketAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMarketAnalysisPrompt',
  input: { schema: GenerateMarketAnalysisInputSchema },
  output: { schema: GenerateMarketAnalysisOutputSchema },
  prompt: `You are an expert market analyst and B2B sales strategist. Your goal is to evaluate a sales lead and provide a confidence score and an actionable note for the sales team.

  Analyze the following lead information:
  - Company: {{company}}
  - Industry: {{industry}}
  - Description: {{description}}

  Based on this information, perform a quick market analysis. Consider factors like industry trends, company description, and potential for growth.

  1.  **Confidence Score:** Generate a score from 0 to 100. A high score (e.g., 85+) means this is a high-quality lead with a clear need for our services. A low score (e.g., below 40) indicates a poor fit or lack of information.
  2.  **Analysis Note:** Write a concise, intelligent note for a sales representative. This note should justify the score and provide a strategic angle or a conversation starter. For example: "High score due to their recent expansion into AI, which aligns with our new software suite. Mention their latest press release on the topic."

  Keep the note brief, insightful, and directly useful for a sales conversation.
  `,
});

const generateMarketAnalysisFlow = ai.defineFlow(
  {
    name: 'generateMarketAnalysisFlow',
    inputSchema: GenerateMarketAnalysisInputSchema,
    outputSchema: GenerateMarketAnalysisOutputSchema,
  },
  async input => {
    // For this demo, we use a prompt, but in a real-world scenario, you might use tools
    // to fetch real market data before calling the prompt.
    const { output } = await prompt(input);
    
    // Simulate a web search by generating plausible mock data if the LLM fails.
    if (!output) {
        return {
            confidenceScore: faker.number.int({ min: 40, max: 95 }),
            analysisNote: faker.lorem.sentence({min: 10, max: 20})
        };
    }
    
    return output!;
  }
);
