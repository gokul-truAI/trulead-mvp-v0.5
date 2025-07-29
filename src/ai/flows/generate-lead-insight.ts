'use server';

/**
 * @fileOverview An AI agent for generating lead insights.
 *
 * - generateLeadInsight - A function that generates a lead insight.
 * - GenerateLeadInsightInput - The input type for the generateLeadInsight function.
 * - GenerateLeadInsightOutput - The return type for the generateLeadInsight function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLeadInsightInputSchema = z.object({
  company: z.string().optional().describe('The name of the company.'),
  industry: z.string().optional().describe('The industry of the company.'),
  description: z.string().optional().describe('A short description of the company.')
});
export type GenerateLeadInsightInput = z.infer<typeof GenerateLeadInsightInputSchema>;

const GenerateLeadInsightOutputSchema = z.object({
  insight: z.string().describe('A short, actionable sales insight based on the company profile. Highlight a potential need or conversation starter.'),
});
export type GenerateLeadInsightOutput = z.infer<typeof GenerateLeadInsightOutputSchema>;

export async function generateLeadInsight(input: GenerateLeadInsightInput): Promise<GenerateLeadInsightOutput> {
  return generateLeadInsightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLeadInsightPrompt',
  input: {schema: GenerateLeadInsightInputSchema},
  output: {schema: GenerateLeadInsightOutputSchema},
  prompt: `You are an expert B2B sales development assistant. Your goal is to provide a concise, compelling insight for a sales representative based on the provided lead information. The insight should be a potential angle for a conversation.

  Lead Information:
  - Company: {{company}}
  - Industry: {{industry}}
  - Description: {{description}}

  Generate one actionable insight. For example, if they manufacture equipment, suggest how they could benefit from a new material or software. If they are in a competitive market, suggest a potential differentiator. Keep it brief and punchy.`,
});

const generateLeadInsightFlow = ai.defineFlow(
  {
    name: 'generateLeadInsightFlow',
    inputSchema: GenerateLeadInsightInputSchema,
    outputSchema: GenerateLeadInsightOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
