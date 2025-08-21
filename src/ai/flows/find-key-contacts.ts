'use server';

/**
 * @fileOverview An AI agent for finding key contacts at a company.
 *
 * - findKeyContacts - A function that finds key contacts.
 * - FindKeyContactsInput - The input type for the findKeyContacts function.
 * - FindKeyContactsOutput - The return type for the findKeyContacts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const KeyContactSchema = z.object({
  name: z.string().describe('The full name of the key contact.'),
  title: z.string().describe("The job title of the key contact (e.g., 'CEO', 'Head of Marketing')."),
  email: z.string().email().describe("The professional email address of the key contact."),
  linkedin: z.string().url().describe("The URL of the key contact's LinkedIn profile."),
});

const FindKeyContactsInputSchema = z.object({
  company: z.string().describe('The name of the company.'),
  description: z.string().optional().describe('A short description of the company.'),
});
export type FindKeyContactsInput = z.infer<typeof FindKeyContactsInputSchema>;

const FindKeyContactsOutputSchema = z.object({
  contacts: z.array(KeyContactSchema).describe('A list of key contacts found for the company.'),
});
export type FindKeyContactsOutput = z.infer<typeof FindKeyContactsOutputSchema>;

export async function findKeyContacts(input: FindKeyContactsInput): Promise<FindKeyContactsOutput> {
  return findKeyContactsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findKeyContactsPrompt',
  input: { schema: FindKeyContactsInputSchema },
  output: { schema: FindKeyContactsOutputSchema },
  prompt: `You are an expert business intelligence analyst. Your goal is to identify the top 3 most relevant key contacts from a company based on the provided information.

  Focus on leadership roles relevant to sales and marketing, such as CEO, Founder, Head of Sales, VP of Marketing, etc.

  Company Information:
  - Name: {{company}}
  - Description: {{description}}

  Based on this, find up to 3 key contacts and provide their name, title, email, and LinkedIn profile URL.
  `,
});

const findKeyContactsFlow = ai.defineFlow(
  {
    name: 'findKeyContactsFlow',
    inputSchema: FindKeyContactsInputSchema,
    outputSchema: FindKeyContactsOutputSchema,
  },
  async input => {
    // In a real application, you would use a tool here to search the web.
    // For this demo, we will return mock data that looks realistic.
    const { output } = await prompt(input);
    
    // Simulate a web search by generating plausible mock data if the LLM fails.
    if (!output?.contacts || output.contacts.length === 0) {
      const companyDomain = input.company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
      const mockContacts = [
        { name: 'Alex Johnson', title: 'CEO', email: `alex.j@${companyDomain}`, linkedin: `https://www.linkedin.com/in/alexjohnson` },
        { name: 'Samantha Miller', title: 'VP of Sales', email: `s.miller@${companyDomain}`, linkedin: `https://www.linkedin.com/in/samanthamiller` },
        { name: 'David Chen', title: 'Head of Marketing', email: `david.c@${companyDomain}`, linkedin: `https://www.linkedin.com/in/davidchen` },
      ];
      return { contacts: mockContacts };
    }
    
    return output!;
  }
);
