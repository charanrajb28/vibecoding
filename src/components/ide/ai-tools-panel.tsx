"use client"

import * as React from "react"
import { Wand2, Loader2, Bot, MessageSquareQuote } from "lucide-react"

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
  const [activeTab, setActiveTab] = React.useState<'explanation' | 'completion' | null>(null);


  const handleExplain = async () => {
    setIsLoading(true);
    setExplanation("");
    setCompletion("");
    setCorrectness(null);
    setActiveTab('explanation');
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
      setActiveTab(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setExplanation("");
    setCompletion("");
    setCorrectness(null);
    setActiveTab('completion');
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
      setActiveTab(null);
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">AI is thinking...</p>
        </div>
      )
    }

    if (activeTab === 'completion' && completion) {
      return (
        <Card className="bg-muted/50 border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Code Suggestion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <pre className="bg-background p-3 rounded-md font-code text-xs overflow-x-auto">
              <code>{completion}</code>
            </pre>
            {explanation && <p className="text-sm text-muted-foreground mt-2">{explanation}</p>}
            {correctness !== null && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs">Correctness Score</Label>
                    <span className="text-xs font-mono">{Math.round(correctness * 100)}%</span>
                </div>
                <Progress value={correctness * 100} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    if (activeTab === 'explanation' && explanation) {
        return (
            <Card className="bg-muted/50 border-0 shadow-none">
                <CardHeader>
                    <CardTitle className="text-base">Code Explanation</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{explanation}</p>
                </CardContent>
            </Card>
        );
    }

    return null;
  }

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
            <Label htmlFor="ai-code-input" className="text-xs">Code Snippet</Label>
            <Textarea
              id="ai-code-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-code h-48 mt-1"
              placeholder="Paste your code here..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleComplete} disabled={isLoading}>
              {isLoading && activeTab === 'completion' ? <Loader2 className="animate-spin" /> : <Wand2 />}
              Complete
            </Button>
            <Button onClick={handleExplain} disabled={isLoading} variant="secondary">
              {isLoading && activeTab === 'explanation' ? <Loader2 className="animate-spin" /> : <MessageSquareQuote />}
              Explain
            </Button>
          </div>
          
          <div className="mt-4">
            {renderResult()}
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
