"use client"

import * as React from "react"
import { Wand2, Loader2, Bot, MessageSquareQuote, Send, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AiToolsPanel() {
  const { toast } = useToast();
  const [messages, setMessages] = React.useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! How can I help you with your code today?' }
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: `This is a simulated response to: "${input}". The real AI logic would go here.`
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <div className="h-full flex flex-col bg-card">
      <CardHeader className="flex-shrink-0 border-b">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Bot className="h-5 w-5" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <div className="flex-grow flex flex-col overflow-hidden">
        <ScrollArea className="flex-grow" ref={scrollAreaRef}>
          <div className="p-4 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.role === 'user' && "justify-end"
                )}
              >
                {message.role === 'assistant' ? (
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback><Bot className="h-4 w-4"/></AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="h-8 w-8 border">
                     <AvatarFallback><User className="h-4 w-4"/></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm max-w-[80%]",
                    message.role === 'user' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                 {message.role === 'user' && (
                   <Avatar className="h-8 w-8 border">
                     <AvatarFallback><User className="h-4 w-4"/></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
                <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 border">
                        <AvatarFallback><Bot className="h-4 w-4"/></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-3 py-2 text-sm bg-muted flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin"/>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-4 flex-shrink-0 bg-card">
          <form onSubmit={handleSendMessage} className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI anything..."
              className="pr-12"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
