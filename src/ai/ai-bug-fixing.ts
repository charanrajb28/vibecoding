// A Genkit Flow that provides AI-powered bug-fixing suggestions.
// It takes code snippet and returns suggestions for bug fixes.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIBugFixingInputSchema = z.object({
  code: z.string().describe('The code snippet to be analyzed for bugs.'),
  language: z.string().describe('The programming language of the code snippet.'),
});
export type AIBugFixingInput = z.infer<typeof AIBugFixingInputSchema>;

const AIBugFixingOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of bug-fixing suggestions.'),
  explanation: z.string().describe('An explanation of the potential bugs and the suggestions.'),
});
export type AIBugFixingOutput = z.infer<typeof AIBugFixingOutputSchema>;

export async function aiBugFixing(input: AIBugFixingInput): Promise<AIBugFixingOutput> {
  return aiBugFixingFlow(input);
}

const bugFixingPrompt = ai.definePrompt({
  name: 'bugFixingPrompt',
  input: {schema: AIBugFixingInputSchema},
  output: {schema: AIBugFixingOutputSchema},
  prompt: `You are an AI expert in debugging code. Review the provided code snippet and provide suggestions for bug fixes, along with an explanation of the potential bugs and your suggestions.

  Language: {{{language}}}

  Code Snippet:
  {{code}}
  
  Respond in the following format:
  ```json
  {
    "suggestions": ["suggestion 1", "suggestion 2"],
    "explanation": "Explanation of bugs and suggestions"
  }
  ````,
});

const aiBugFixingFlow = ai.defineFlow(
  {
    name: 'aiBugFixingFlow',
    inputSchema: AIBugFixingInputSchema,
    outputSchema: AIBugFixingOutputSchema,
  },
  async input => {
    const {output} = await bugFixingPrompt(input);
    return output!;
  }
);
