'use server';

/**
 * @fileOverview An AI agent for generating lead insights.
 *
 * - generateLeadInsight - A function that generates a lead insight.
 * - GenerateLeadInsightInput - The input type for the generateLeadInsight function.
 * - GenerateLeadInsightOutput - The return type for the generateLeadInsight function.
 * - generateAnalyticsInsight - A function that generates an analytics insight for admins.
 * - GenerateAnalyticsInsightOutput - The return type for the generateAnalyticsInsight function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { LeadRequest } from '@/lib/types';

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


const GenerateAnalyticsInsightInputSchema = z.object({
    requests: z.custom<LeadRequest[]>().describe("A list of all lead requests submitted by users.")
});

const GenerateAnalyticsInsightOutputSchema = z.object({
  insight: z.string().describe('A high-level analysis of user request trends and a suggestion for improving the service or user experience.'),
});
export type GenerateAnalyticsInsightOutput = z.infer<typeof GenerateAnalyticsInsightOutputSchema>;


export async function generateLeadInsight(input: GenerateLeadInsightInput): Promise<GenerateLeadInsightOutput> {
  return generateLeadInsightFlow(input);
}

export async function generateAnalyticsInsight(input: { requests: LeadRequest[] }): Promise<GenerateAnalyticsInsightOutput> {
  return generateAnalyticsInsightFlow(input);
}


const leadInsightPrompt = ai.definePrompt({
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
    const {output} = await leadInsightPrompt(input);
    return output!;
  }
);


const analyticsInsightPrompt = ai.definePrompt({
    name: 'generateAnalyticsInsightPrompt',
    input: { schema: GenerateAnalyticsInsightInputSchema },
    output: { schema: GenerateAnalyticsInsightOutputSchema },
    prompt: `You are an expert business analyst for a lead generation service. Your task is to analyze user request data and provide a key insight for the site administrator.

    Analyze the following list of lead requests:
    {{#each requests}}
    - Category: {{this.category}}, Region: {{this.continent}}, Status: {{this.status}}, Date: {{this.requestDate}}
    {{/each}}

    Based on this data, identify a key trend. Are users frequently requesting a specific industry? Is one continent much more popular than others? Are there many pending requests that indicate a bottleneck?

    Formulate a single, actionable insight. For example: "There is high demand for 'renewable energy' leads in Europe. We should prioritize sourcing more data for this sector to improve user satisfaction." Or: "A large number of requests are pending. We should investigate our approval process to ensure timely delivery of leads."
    `
});

const generateAnalyticsInsightFlow = ai.defineFlow(
    {
        name: 'generateAnalyticsInsightFlow',
        inputSchema: GenerateAnalyticsInsightInputSchema,
        outputSchema: GenerateAnalyticsInsightOutputSchema,
    },
    async (input) => {
        const { output } = await analyticsInsightPrompt(input);
        return output!;
    }
);
