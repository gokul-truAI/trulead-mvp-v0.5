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
  location: z.string().optional().describe('The location of the company.'),
  contactName: z.string().optional().describe('The name of the contact person.'),
  email: z.string().optional().describe('The email address of the contact person.'),
});
export type GenerateLeadInsightInput = z.infer<typeof GenerateLeadInsightInputSchema>;

const GenerateLeadInsightOutputSchema = z.object({
  insight: z.string().describe('An AI-generated insight about the lead.'),
});
export type GenerateLeadInsightOutput = z.infer<typeof GenerateLeadInsightOutputSchema>;

export async function generateLeadInsight(input: GenerateLeadInsightInput): Promise<GenerateLeadInsightOutput> {
  return generateLeadInsightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLeadInsightPrompt',
  input: {schema: GenerateLeadInsightInputSchema},
  output: {schema: GenerateLeadInsightOutputSchema},
  prompt: `You are an AI assistant that generates insights about potential leads for TruLeadAI users.

  If any of the lead information is missing, identify a replacement lead from the stack that is most relevant. 
  Provide a concise and compelling insight to encourage the user to click through for more details.

  Company: {{company}}
  Industry: {{industry}}
  Location: {{location}}
  Contact Name: {{contactName}}
  Email: {{email}}`,
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
