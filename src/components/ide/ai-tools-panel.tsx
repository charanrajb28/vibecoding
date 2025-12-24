"use client"

import * as React from "react"
import { Wand2, Loader2, Bot } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { sampleCode } from "@/lib/placeholder-data"
import { aiCodeCompletion } from "@/ai/flows/ai-code-completion"
import { explainCode } from "@/ai/flows/ai-code-explanation"
import { useToast } from "@/hooks/use-toast"

export default function AiToolsPanel() {
  const { toast } = useToast();
  const [code, setCode] = React.useState(sampleCode);
  const [isLoading, setIsLoading] = React.useState(false);
  const [explanation, setExplanation] = React.useState("");
  const [completion, setCompletion] = React.useState("");
  const [correctness, setCorrectness] = React.useState<number | null>(null);

  const handleExplain = async () => {
    setIsLoading(true);
    setExplanation("");
    setCompletion("");
    setCorrectness(null);
    try {
      const result = await explainCode({ code });
      setExplanation(result.explanation);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get code explanation.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setExplanation("");
    setCompletion("");
    setCorrectness(null);
    try {
      // Assuming cursor is at the end for this simulation
      const result = await aiCodeCompletion({ code, cursorPosition: code.length });
      setCompletion(result.completion);
      setExplanation(result.explanation || "");
      setCorrectness(result.correctnessScore || 0);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get code completion.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-card p-2 overflow-y-auto">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-5 w-5" />
            AI Assistant
          </CardTitle>
          <CardDescription>
            Use AI to explain, complete, or refactor your code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ai-code-input">Code Snippet</Label>
            <Textarea
              id="ai-code-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-code h-48 mt-1"
              placeholder="Paste your code here..."
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleComplete} disabled={isLoading} className="flex-1">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
              Complete
            </Button>
            <Button onClick={handleExplain} disabled={isLoading} variant="secondary" className="flex-1">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Explain
            </Button>
          </div>
          {isLoading && <p className="text-sm text-muted-foreground text-center">AI is thinking...</p>}

          {completion && (
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Code Suggestion</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-2 rounded-md font-code text-xs overflow-x-auto">
                  <code>{completion}</code>
                </pre>
                {explanation && <p className="text-sm text-muted-foreground mt-2">{explanation}</p>}
                {correctness !== null && (
                  <div className="mt-4">
                    <Label className="text-xs">Correctness Score: {correctness * 10}%</Label>
                    <Progress value={correctness * 10} className="h-2 mt-1" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {explanation && !completion && (
             <Card>
             <CardHeader>
               <CardTitle className="text-md">Code Explanation</CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-sm">{explanation}</p>
             </CardContent>
           </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
