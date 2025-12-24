"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Line = {
  id: number;
  type: 'command' | 'output';
  content: string;
};

export default function TerminalPane() {
  const [lines, setLines] = React.useState<Line[]>([
    { id: 1, type: 'output', content: 'Welcome to the CodeSail terminal!' },
    { id: 2, type: 'output', content: 'Type `help` to see available commands.' },
  ]);
  const [input, setInput] = React.useState('');
  const endOfTerminalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endOfTerminalRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleCommand = (command: string) => {
    const newLines: Line[] = [
      ...lines, 
      { id: Date.now(), type: 'command', content: command }
    ];

    let output = `command not found: ${command}`;
    if (command.trim() === 'help') {
      output = 'Available commands: help, clear, date, echo [text]';
    } else if (command.trim() === 'clear') {
        setLines([]);
        return;
    } else if (command.trim() === 'date') {
        output = new Date().toString();
    } else if (command.trim().startsWith('echo ')) {
        output = command.substring(5);
    }
    
    newLines.push({ id: Date.now() + 1, type: 'output', content: output });
    setLines(newLines);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      handleCommand(input);
      setInput('');
    }
  };

  const Prompt = () => (
    <>
      <span className="text-green-400">user@codesail:</span>
      <span className="text-blue-400">~/my-project</span>
      <span>$ </span>
    </>
  );

  return (
    <div className="h-full flex flex-col bg-card text-sm">
      <Tabs defaultValue="terminal" className="flex flex-col h-full">
        <TabsList className="flex-none justify-start rounded-none bg-transparent border-b p-0 m-0">
          <TabsTrigger value="terminal" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-primary border-b-2 border-transparent">Terminal</TabsTrigger>
          <TabsTrigger value="console" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-primary border-b-2 border-transparent">Console</TabsTrigger>
          <TabsTrigger value="problems" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-primary border-b-2 border-transparent">Problems</TabsTrigger>
        </TabsList>
        <TabsContent value="terminal" className="flex-grow p-4 font-code overflow-auto mt-0" onClick={() => document.getElementById('terminal-input')?.focus()}>
          <div className="h-full">
            {lines.map(line => (
              <div key={line.id}>
                {line.type === 'command' && <div className="flex"><Prompt /><span>{line.content}</span></div>}
                {line.type === 'output' && <p className="text-muted-foreground">{line.content}</p>}
              </div>
            ))}
             <div className="flex">
              <Prompt />
              <input
                id="terminal-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none outline-none text-foreground font-code flex-grow"
                autoFocus
              />
            </div>
            <div ref={endOfTerminalRef} />
          </div>
        </TabsContent>
        <TabsContent value="console" className="flex-grow p-4 font-code overflow-auto mt-0">
          <p className="text-muted-foreground">[LOG] Component mounted.</p>
        </TabsContent>
        <TabsContent value="problems" className="flex-grow p-4 font-code overflow-auto mt-0">
          <p className="text-muted-foreground">No problems have been detected in the workspace.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
