'use server';

/**
 * @fileOverview This file defines a Genkit flow for AI-powered code completion.
 *
 * The flow takes code and a cursor position as input and returns a code completion suggestion.
 *
 * @aicodeCompletion - A function that handles the code completion process.
 * @AICodeCompletionInput - The input type for the aicodeCompletion function.
 * @AICodeCompletionOutput - The return type for the aicodeCompletion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AICodeCompletionInputSchema = z.object({
  code: z.string().describe('The code to complete.'),
  cursorPosition: z.number().describe('The cursor position in the code.'),
});
export type AICodeCompletionInput = z.infer<typeof AICodeCompletionInputSchema>;

const AICodeCompletionOutputSchema = z.object({
  completion: z.string().describe('The code completion suggestion.'),
  explanation: z.string().optional().describe('Explanation of the completion suggestion.'),
  correctnessScore: z.number().optional().describe('Correctness score of the suggestion'),
});
export type AICodeCompletionOutput = z.infer<typeof AICodeCompletionOutputSchema>;

async function assessCodeCorrectness(codeSnippet: string): Promise<number> {
  const prompt = ai.definePrompt({
    name: 'assessCodeCorrectnessPrompt',
    input: {schema: z.string()},
    output: {schema: z.number()},
    prompt: `You are a senior software engineer, tasked with examining code snippets for correctness.  Given the code snippet below, provide a score (0-10) on how likely the code snippet is to be correct.  Return ONLY the number representing the score.  Do not provide any other output. The score should consider syntax, logic, and best practices. Higher scores mean the code is likely correct, while lower scores indicate potential issues.

Code Snippet:
{{codeSnippet}}`,
  });

  const {output} = await prompt(codeSnippet);
  return output ?? 5; // Default to a neutral score if the LLM fails to provide one
}

export async function aiCodeCompletion(input: AICodeCompletionInput): Promise<AICodeCompletionOutput> {
  return aiCodeCompletionFlow(input);
}

const codeCompletionPrompt = ai.definePrompt({
  name: 'codeCompletionPrompt',
  input: {schema: AICodeCompletionInputSchema},
  output: {schema: AICodeCompletionOutputSchema},
  prompt: `You are a code completion AI.  Given the following code and cursor position, provide a code completion suggestion.  Also provide a brief explanation of the suggestion.

Code:
{{code}}

Cursor Position: {{cursorPosition}}

Completion:`, // No explanation needed in prompt, it's handled by the LLM's output schema.
});

const aiCodeCompletionFlow = ai.defineFlow(
  {
    name: 'aiCodeCompletionFlow',
    inputSchema: AICodeCompletionInputSchema,
    outputSchema: AICodeCompletionOutputSchema,
  },
  async input => {
    const {output} = await codeCompletionPrompt(input);

    if (output) {
      const correctnessScore = await assessCodeCorrectness(output.completion);
      return {...output, correctnessScore};
    }

    return {
      completion: '',
      explanation: 'No completion suggestion available.',
      correctnessScore: 0,
    };
  }
);
